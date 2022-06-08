const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('log4js').getLogger("ping");
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const { v2, auth } = require('osu-api-extended')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('osu-profile')
        .setDescription('Display your Osu profile')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Username or UserID')
                .setRequired(true)),


    async execute(interaction) {
        const user = interaction.options.getString('username');

        await auth.login(process.env.OSUID, process.env.OSUSECRET)
        const data = await v2.user.details(user, "osu", "")
        log.info(`Looking at ${user}'s Osu Profile`)

        const embed = new MessageEmbed()
            .setTitle(`${user}'s Profile`)
            .setColor(`#FFD4FF`)
            .setAuthor({ name: user, iconURL: data.avatar_url, url: `https://osu.ppy.sh/users/${user}` })
            .addFields(
                { name: 'Level', value: `${data.statistics.level.current}`, inline: true },
                { name: 'Rank', value: `${data.statistics.global_rank}`, inline: true },
                { name: 'Accuracy', value: `${data.statistics.hit_accuracy}%`, inline: true },
                { name: 'Country', value: `${data.country.name}`, inline: true },
                { name: 'ID', value: `${data.id}`, inline: true },
                { name: 'Performance Points', value: `${data.statistics.pp}`, inline: true },
            )
            .setThumbnail(data.avatar_url)
            .setImage(data.cover_url)
            .setTimestamp()
            .setFooter({ text: `https://osu.ppy.sh/users/${data.id}` });

        const osuP = await interaction.reply({ embeds: [embed], fetchReply: true });
    }
};