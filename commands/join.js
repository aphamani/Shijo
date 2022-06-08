const { SlashCommandBuilder } = require('@discordjs/builders');
const { VoiceConnectionStatus, entersState, getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');
const log = require('log4js').getLogger('Join');

async function connectToChannel(client, interaction) {

	const channel = interaction.member.voice.channel;

	if (!interaction.member.voice.channelId) {
		log.warn('The user is not in a voice channel');
		await interaction.reply('Please join a Voice Channel first !');
		return;
	}

	const connection = getVoiceConnection(interaction.guild.id);

	if (connection) {
		await interaction.reply('Already connected');
		return;
	}
	const newConnection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});

	newConnection.on(VoiceConnectionStatus.Ready, () => {
		interaction.reply('I\'am on the channel !');
	});

	newConnection.on(VoiceConnectionStatus.Disconnected, async () => {
		try {
			await Promise.race([
				entersState(newConnection, VoiceConnectionStatus.Signalling, 5_000),
				entersState(newConnection, VoiceConnectionStatus.Connecting, 5_000),
			]);
			// Seems to be reconnecting to a new channel - ignore disconnect
		}
		catch (error) {
			// Seems to be a real disconnect which SHOULDN'T be recovered from
			newConnection.destroy();
		}
	});

	newConnection.on(VoiceConnectionStatus.Destroyed, () => {
		// try to delete the queue
		if (client.queues) {
			client.queues.delete(channel.guild.id);
		}
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Join a channel'),
	async execute(client, interaction) {
		await connectToChannel(client, interaction);
	},
};