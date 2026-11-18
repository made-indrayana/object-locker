const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { errorTitle } = require('../../../config.json');
const database = require('../../database');
const lockstatus = require('./lockstatus');
const { embed, handleError, autoDeleteReply, parseObjectNames } = require('../../utility/handler');

const commandName = 'lock';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Use command to lock object on the channel.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName('objects')
                .setDescription('Object(s) to be locked, separated by space')
                .setRequired(true)),
    async execute(interaction) {
        const objects = parseObjectNames(interaction.options.getString('objects'));

        if (objects.length === 0) {
            await interaction.reply({
                embeds: [embed(errorTitle, 'Please tell me which object(s) you want to lock!', 'error')],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();

        const lockMessages = [];
        const errMessages = [];

        for (const objectName of objects) {
            try {
                await database.createEntry(
                    interaction.guild.id,
                    interaction.guild.name,
                    interaction.channel.id,
                    interaction.channel.name,
                    interaction.user.id,
                    interaction.user.username,
                    objectName,
                );
                lockMessages.push(`\`${objectName}\` is now locked!`);
            }
            catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError')
                    errMessages.push(`\`${objectName}\` is already locked!`);
                else {
                    handleError(err);
                    errMessages.push(`\`${objectName}\` could not be locked, please try again.`);
                }
            }
        }

        const embeds = [];
        if (lockMessages.length > 0)
            embeds.push(embed('Locked!', lockMessages.join('\n'), 'success'));
        if (errMessages.length > 0)
            embeds.push(embed(errorTitle, errMessages.join('\n'), 'error'));

        await interaction.editReply({ embeds });
        autoDeleteReply(interaction);
        await lockstatus.postChannelStatus(interaction);
    },
};
