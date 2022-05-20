const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger('Twitch');
const axios = require('axios');
const TwitchJs = require('twitch-js').default;

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

async function checkIsLiveTwitch(client) {
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

	twitchJs.api.get('streams', { search: { user_login: process.env.channelTwitchName } })
		.then(response => {
			if (response.data.length > 0) {
				log.info('Chaine de ' + process.env.channelTwitchName + ' en live !');
				client.user.setActivity(process.env.channelTwitchName, { name :response.data.title, type : 'STREAMING', url: 'https://www.twitch.tv/' + process.env.channelTwitchName });
			}
			else {
				client.user.setPresence({ activities:[], status: 'online' });
			}
		});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Check twitch account status (live or not)'),
	async execute(interaction) {
		checkIsLiveTwitch(interaction.client);
		await interaction.reply('Status actualisé !');
	},
};