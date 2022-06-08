const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a Poll')
        .addStringOption(option =>
		    option.setName('title')
			    .setDescription('Title of the Poll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Question of the Poll')
                .setRequired(true)),

    
    async execute(client, interaction) {
        const pollTitle = interaction.options.getString('title');
        const pollContent = interaction.options.getString('content');
        

        const embed = new MessageEmbed()
            .setTitle(pollTitle)
            .setColor(`#00a3b5`)
            .setDescription(pollContent)
            .setTimestamp()
            .setFooter({ text: `New Poll created by ${interaction.user.tag}!`});

        const poll = await interaction.reply({ embeds: [embed], fetchReply: true });
        poll.react('✅');
        poll.react('❎');
    }
}