const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const log = require('log4js').getLogger('Twitch');
const axios = require('axios');
const TwitchJs = require('twitch-js').default;
const fs = require('fs');
const list = require('../config/list-channel.json');

function getSettingsTwitch(client) {
	log.trace('getSettingsTwitch');
	client.twitch.set('clientId', process.env.clientIdTwitch);
	client.twitch.set('clientSecret', process.env.clientSecret);
	client.twitch.set('username', 'Shijo');
}

async function authenticationTwitch(client) {
	log.trace('authenticationTwitch');
	getSettingsTwitch(client);

	const body = {
		client_id: client.twitch.get('clientId'),
		client_secret:  client.twitch.get('clientSecret'),
		grant_type: 'client_credentials',
	};

	try {

		const data = await axios('https://id.twitch.tv/oauth2/token', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			data: JSON.stringify(body),
		}).then(function(response) {
			log.debug('Successful authentication on the api');
			return response.data;
		}).catch(function(error) {
			if (error.response.status == 400) {
				log.error('Authentication Failure');
				return { access_token : null };
			}
		});

		return data.access_token;
	}
	catch (error) {
		log.error(error);
	}
}

async function checkIsLiveTwitch(client, MainChannel, channelTwitchName = null) {
	log.trace('checkIsLiveTwitch');

	if (!client.twitch.get('access_token')) {
		const access_token = await authenticationTwitch(client);
		client.twitch.set('access_token', access_token);
	}

	const onAuthenticationFailure = () => new Promise((resolve) => {

		const token = authenticationTwitch(client);

		resolve(token);
	});

	const twitchJs = new TwitchJs({ token : client.twitch.get('access_token'), clientId : client.twitch.get('clientId'), onAuthenticationFailure });

	if (MainChannel) {

		twitchJs.api.get('streams', { search: { user_login: process.env.channelTwitchName } })
			.then(response => {

				if (response.data.length > 0) {
					log.info(process.env.channelTwitchName + ' in live !');
					client.user.setActivity(process.env.channelTwitchName, { name :response.data.title, type : 'STREAMING', url: 'https://www.twitch.tv/' + process.env.channelTwitchName });
					sendOnChannel(client, response.data);
				}
				else {
					client.user.setPresence({ activities:[], status: 'online' });
				}
			});
	}
	else {
		twitchJs.api.get('streams', { search: { user_login: channelTwitchName } })
			.then(response => {
				if (response.data.length > 0) {
					log.info(channelTwitchName + ' in live !');
					sendOnChannel(client, response.data);
				}
			});
	}
}

function addToList(channel_name, id_user_discord) {
	log.trace('addToList');

	const id = list.findIndex(i => i.channel_name === channel_name);

	if (id == -1) {
		list.push({ 'channel_name':channel_name, 'id_user_discord':id_user_discord });

		try {
			fs.writeFile ('./config/list-channel.json', JSON.stringify(list), (err) => { if (err) throw err; });
			log.info('The channel ' + channel_name + ' has been added to the list');
			return true;
		}
		catch (error) {
			log.error(error);
			return false;
		}
	}
	else {
		log.warn('Channel ' + channel_name + ' is already present in the list');
		return false;
	}

}

function deleteToList(channel_name) {
	log.trace('deleteToList');

	const id = list.findIndex(i => i.channel_name === channel_name);

	if (id != -1) {
		list.splice(id, 1);

		try {
			fs.writeFile ('./config/list-channel.json', JSON.stringify(list), (err) => { if (err) throw err; });
			log.info('The channel ' + channel_name + ' has been removed from the list');
			return true;
		}
		catch (error) {
			log.error(error);
			return false;
		}
	}
	else {
		log.warn('Channel ' + channel_name + ' not found');
		return false;
	}

}

function sendOnChannel(client, data) {
	log.trace('sendOnChannel');

	const channel = client.channels.cache.get(process.env.idChannelText);

	let thumbnailUrl = data[0].thumbnailUrl.replace('{width}', 500);
	thumbnailUrl = thumbnailUrl.replace('{height}', 300);

	const exampleEmbed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle(String(data[0].title))
		.setURL('https://www.twitch.tv/' + process.env.channelTwitchName)
		.setDescription(data[0].userName + ' in ' + data[0].gameName)
		.setImage(thumbnailUrl)
		.setTimestamp();

	channel.send({ embeds: [exampleEmbed] });

}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('twitch-module')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-to-list')
				.setDescription('Add a channel twitch on the list')
				.addStringOption(option =>
					option.setName('channel_name')
						.setDescription('The name of the twitch channel you want to add')
						.setRequired(true))
				.addUserOption(option =>
					option.setName('name_discord')
						.setDescription('The name of the discord account associated with the channel')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete-to-list')
				.setDescription('Delete a channel twitch on the list')
				.addStringOption(option =>
					option.setName('channel_name')
						.setDescription('The name of the twitch channel you want to delete')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('check-is-live-main')
				.setDescription('Check main channel twitch')),
	async execute(client, interaction) {

		if (interaction.options._subcommand != undefined) {
			switch (interaction.options.getSubcommand()) {
			case 'add-to-list':{
				const channel_name = interaction.options.getString('channel_name');
				const user_discord = interaction.options.getMember('name_discord');
				if (addToList(channel_name, user_discord.user.id)) {
					await interaction.reply('Channel added !');
				}
				else {
					await interaction.reply('Channel already present in the list !');
				}
				break;
			}
			case 'delete-to-list':{
				const channel_name = interaction.options.getString('channel_name');
				if (deleteToList(channel_name)) {
					await interaction.reply('Channel deleted !');
				}
				else {
					await interaction.reply('Channel not found in the list !');
				}
				break;
			}
			case 'check-is-live-main':
				checkIsLiveTwitch(interaction.client, true);
				await interaction.reply('Status updated !');
				break;
			}
		}
		else {
			checkIsLiveTwitch(client, true);
		}
	},
	checkChannelOnLiveList: function(client, userId, nameSession) {
		log.trace('checkChannelOnLiveList');

		const id = list.findIndex(i => i.id_user_discord === userId);
		if (id != -1) {

			if (!client.twitch.get(userId)) {
				const NewTime = new Date();
				client.twitch.set(userId, [ NewTime, nameSession ]);
				checkIsLiveTwitch(client, false, list[id].channel_name);
			}
			else {
				const infoSession = client.twitch.get(userId);
				const lastTime = infoSession[0];
				const nowTime = new Date();
				if ((((nowTime - lastTime) / 60000) > 14.55) && nameSession != infoSession[1]) {
					const NewTime = new Date();
					client.twitch.set(userId, [ NewTime, nameSession ]);
					checkIsLiveTwitch(client, false, list[id].channel_name);
				}
			}

		}

	},
};