
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger("ping");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		log.info('PING');
		await interaction.reply('Pong!');
	},
};