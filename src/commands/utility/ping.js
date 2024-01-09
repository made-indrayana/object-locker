const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { embed } = require('../../utility/handler');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply({ embeds: [embed('...Pong!', 'I\'m alive!', 'default', true)] });
        await wait(config.autoDeleteDelay);
        await interaction.deleteReply();
    },
};
