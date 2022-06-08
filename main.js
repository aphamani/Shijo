const { Client, Collection, Intents } = require('discord.js');
const fs = require('node:fs');
const log4js = require('log4js');
const twitch = require('./commands/twitch');

log4js.configure('./config/log4js.json');
const log = log4js.getLogger('Main');

require('dotenv').config({ path: 'config/.env' });

const shijo = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

shijo.music = new Collection();

shijo.twitch = new Collection();

shijo.twitch.set('mainChannelInLive', false);

shijo.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	shijo.commands.set(command.data.name, command);
}

shijo.on('ready', () => {
	log.info('The bot is on');
});

shijo.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = shijo.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(shijo, interaction);
	}
	catch (error) {
		log.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

shijo.on('presenceUpdate', (oldPresence, newPresence) => {

	const listOFActivity = [];

	if (newPresence.user.username == process.env.discordAccountTwitchName && newPresence.user.discriminator == process.env.discordAccountTwitchNumber) {

		for (const activity of newPresence.activities) {
			listOFActivity.push(activity.type);
		}

		const id = listOFActivity.findIndex(i => i === 'STREAMING');

		if (shijo.twitch.get('mainChannelInLive') && id == -1) {

			log.info('End of ' + process.env.discordAccountTwitchName + 'live !');
			shijo.twitch.set('mainChannelInLive', false);
			const command = shijo.commands.get('twitch');
			command.execute(shijo);

		}
		else if (!shijo.twitch.get('mainChannelInLive') && id != -1) {

			log.info(process.env.discordAccountTwitchName + ' in live !');
			shijo.twitch.set('mainChannelInLive', true);
			const command = shijo.commands.get('twitch');
			command.execute(shijo);

		}
	}

	if (newPresence.activities.length == 0) return false;

	newPresence.activities.forEach(async activity => {

		if (activity.type == 'STREAMING') {
			twitch.checkChannelOnLiveList(shijo, newPresence.userId, activity.details);
		}

	});
});


shijo.login(process.env.TOKEN);
