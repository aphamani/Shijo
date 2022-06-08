const fs = require('node:fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus, createAudioResource, createAudioPlayer, getVoiceConnection } = require('@discordjs/voice');
const log = require('log4js').getLogger('Play');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a music')
		.addStringOption(option =>
			option.setName('music_name')
				.setDescription('The name of the music you want to play')
				.setRequired(false)),
	async execute(client, interaction) {

		if (!client.music.get('player')) {

			const player = createAudioPlayer();

			player.on(AudioPlayerStatus.Paused, () => {
				log.debug('The audio player has be paused!');
				client.music.set('paused', true);

			});

			player.on(AudioPlayerStatus.Playing, () => {
				log.debug('The audio player has started playing!');
				client.music.set('paused', false);
			});

			player.on(AudioPlayerStatus.Idle, () => {
				const playlist = client.music.get('playlist');
				playlist.shift();
				if (playlist.length > 0) {
					log.info('Next Song');
					player.play(playlist[0]);
				}
				else {
					log.info('End of playlist');
				}
			});

			player.on('error', error => {
				log.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			});

			client.music.set('player', player);

		}

		const player = client.music.get('player');
		const connection = getVoiceConnection(interaction.guild.id);

		if (client.music.get('playlist') == undefined) {
			const playlist = [];
			client.music.set('playlist', playlist);
		}

		if (!connection) {
			await interaction.reply('But what channel are you in ?');
		}
		else if (interaction.options.getString('music_name') == null) {

			const musicFiles = fs.readdirSync(process.env.dirMusic).filter(file => file.endsWith('.mp3'));
			const playlist = client.music.get('playlist');

			for (const file of musicFiles) {
				const resource = createAudioResource(process.env.dirMusic + '/' + file);
				playlist.push(resource);
			}

			client.music.set('playlist', playlist);

			if (!player.checkPlayable()) {
				player.play(playlist[0]);
				connection.subscribe(player);
			}

			log.info('The audio player play a song !');
			await interaction.reply('Play all music');
		}
		else {
			const musicFiles = fs.readdirSync(process.env.dirMusic).filter(file => file.includes(interaction.options.getString('music_name')));
			if (musicFiles.length == 1) {

				const playlist = client.music.get('playlist');
				const resource = createAudioResource(process.env.dirMusic + '/' + musicFiles[0]);
				playlist.push(resource);

				if (!player.checkPlayable()) {
					player.play(playlist[0]);
					connection.subscribe(player);
				}

				client.music.set('playlist', playlist);
				log.info('The audio player play a song !');
				await interaction.reply('Play');
			}
		}


	},
};