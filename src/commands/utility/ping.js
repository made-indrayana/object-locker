const { SlashCommandBuilder } = require('discord.js');
const { embed, autoDeleteReply } = require('../../utility/handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply({ embeds: [embed('...Pong!', 'I\'m alive!', 'default', true)] });
        autoDeleteReply(interaction);
    },
};
