const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger('Stop');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop music'),
	async execute(client, interaction) {

		if (!client.music.get('player')) {
			await interaction.reply('I already play a song ?');
		}
		else {
			const player = client.music.get('player');
			player.stop();
			client.music.set('player', undefined);
			client.music.set('playlist', []);
			log.info('Stop to play');
			await interaction.reply('Stop!');
		}

	},
};