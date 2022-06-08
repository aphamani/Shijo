const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger('skip');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip a song!'),
	async execute(client, interaction) {

		if (!client.music.get('player')) {
			await interaction.reply('I already play a song ?');
		}
		else {
			const player = client.music.get('player');
			const playlist = client.music.get('playlist');
			playlist.shift();
			if (playlist.length > 0) {
				log.info('Next Song');
				player.play(playlist[0]);
			}
			else {
				log.info('End of playlist');
				player.stop();
				client.music.set('player', undefined);
				client.music.set('playlist', []);
				log.info('Stop to play');
			}
			await interaction.reply('Skip!');
		}
	},
};