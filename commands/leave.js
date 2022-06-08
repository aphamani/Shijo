const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

const log = require('log4js').getLogger('Leave');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leave a channel'),
	async execute(client, interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		if (connection) {
			connection.destroy();
			log.info('The bot quit the channel');
			await interaction.reply('Bye!');

		}

	},
};