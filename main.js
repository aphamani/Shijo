const { Client, Collection, Intents } = require('discord.js');
const fs = require('node:fs');
require('dotenv').config({ path: 'config/.env' });

const shijo = new Client({
    intents: [

    ]
});

shijo.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	shijo.commands.set(command.data.name, command);
}


shijo.on('ready', () => {
    console.log('The bot is on');
});

shijo.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = shijo.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

shijo.login(process.env.TOKEN);
