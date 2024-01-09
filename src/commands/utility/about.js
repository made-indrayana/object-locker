const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const about = require('../../utility/about-text');

const wait = require('node:timers/promises').setTimeout;

const delayMultiplier = 6;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About me :nerd:'),
    args: false,
    async execute(interaction) {
        await interaction.reply({ embeds: [about] });
        await wait(config.autoDeleteDelay * delayMultiplier);
        await interaction.deleteReply();
    },
};
