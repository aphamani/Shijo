
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger("twitch");
const twitchIsLive = require('../twitchModule')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Check twitch account status (live or not)'),
		async execute(interaction) {
			twitchIsLive(interaction.client);
			await interaction.reply('Status actualisé !');
	},
};