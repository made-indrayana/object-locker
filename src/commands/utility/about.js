const { SlashCommandBuilder } = require('discord.js');
const about = require('../../utility/about-text');
const { autoDeleteReply } = require('../../utility/handler');

const delayMultiplier = 6;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About me :nerd:'),
    async execute(interaction) {
        await interaction.reply({ embeds: [about] });
        autoDeleteReply(interaction, delayMultiplier);
    },
};
