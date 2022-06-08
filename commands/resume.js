const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger('Resume');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume a song!'),
	async execute(client, interaction) {
		if (!client.music.get('player')) {
			await interaction.reply('I already play a song ?');
		}
		else {
			const player = client.music.get('player');
			const pause = client.music.get('paused');
			if (!pause) {
				player.pause();
				log.info('Pause');
				await interaction.reply('Pause!');

			}
			else {
				player.unpause();
				log.info('Play');
				await interaction.reply('Play!');
			}
		}
	},
};