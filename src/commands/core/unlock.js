const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { errorTitle } = require('../../../config.json');
const database = require('../../database');
const lockstatus = require('./lockstatus');
const { embed, handleError, autoDeleteReply, parseObjectNames } = require('../../utility/handler');

const commandName = 'unlock';

async function unlockAll(interaction) {
    try {
        const count = await database.destroyAllEntryFromUser(interaction.guild.id, interaction.channel.id, interaction.user.id);
        if (count === 0)
            return [embed(errorTitle, 'You currently have no object locked!', 'error')];
        return [embed('Unlocked!', `You have successfully unlocked \`${count}\` ${count > 1 ? 'objects' : 'object'}!`, 'success')];
    }
    catch (err) {
        handleError(err);
        return [embed(errorTitle, 'Your objects could not be unlocked, please try again.', 'error')];
    }
}

async function unlockObjects(interaction, objects) {
    const unlockMessages = [];
    const errMessages = [];

    for (const objectName of objects) {
        try {
            const count = await database.destroyEntry(interaction.guild.id, interaction.channel.id, objectName);
            if (count === 0)
                errMessages.push(`\`${objectName}\` is not locked!`);
            else
                unlockMessages.push(`\`${objectName}\` is unlocked!`);
        }
        catch (err) {
            handleError(err);
            errMessages.push(`\`${objectName}\` could not be unlocked, please try again.`);
        }
    }

    const embeds = [];
    if (unlockMessages.length > 0)
        embeds.push(embed('Unlocked!', unlockMessages.join('\n'), 'success'));
    if (errMessages.length > 0)
        embeds.push(embed(errorTitle, errMessages.join('\n'), 'error'));
    return embeds;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Use command to unlock object on the channel.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName('objects')
                .setDescription('Object(s) to be unlocked, separated by space. If empty, all of your locked objects will be unlocked.')
                .setRequired(false)),
    async execute(interaction) {
        const objects = parseObjectNames(interaction.options.getString('objects'));

        const embeds = objects.length === 0
            ? await unlockAll(interaction)
            : await unlockObjects(interaction, objects);

        await interaction.reply({ embeds });
        autoDeleteReply(interaction);
        await lockstatus.postChannelStatus(interaction);
    },
};
