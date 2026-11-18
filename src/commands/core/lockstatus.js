const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
// Loaded on first use so deploy-commands.js can read command definitions without opening the database.
const getDatabase = () => require('../../database');
const { embed, handleError } = require('../../utility/handler');

const commandName = 'lockstatus';
const maxDescriptionLength = 4096;
const channelFooter = 'This message will persist until the next status message is issued.';
const serverFooter = 'Server-wide status. Only you can see this message.';

function limitLength(lines) {
    const text = lines.join('\n');
    if (text.length <= maxDescriptionLength)
        return text;
    return `${text.slice(0, maxDescriptionLength - 4)}\n...`;
}

/**
 * @param {string} guildId Guild to report on.
 * @param {string | null} channelId Restrict the report to this channel, or null for the whole guild.
 * @param {string} footer Footer text of the embed.
 */
async function buildStatusEmbed(guildId, channelId, footer) {
    const where = { serverID: guildId };
    if (channelId)
        where.channelID = channelId;

    const results = await getDatabase().Entry.findAll({ where, order: [['createdAt', 'ASC']] });

    let lines;
    if (results.length === 0)
        lines = ['No object is currently locked.'];
    else if (channelId)
        lines = results.map((entry) => `<@${entry.userID}> is locking \`${entry.lockedObject}\``);
    else
        lines = results.map((entry) => `<@${entry.userID}> is locking \`${entry.lockedObject}\` in <#${entry.channelID}>`);

    return embed(results.length > 1 ? 'Locked Objects' : 'Locked Object', limitLength(lines), 'default', false, footer);
}

/**
 * Remembers the given message as the channel's latest status message and deletes the previous one.
 */
async function replaceStatusMessage(guild, channel, messageId) {
    const existing = await getDatabase().LockStatusMessages.findOne({
        where: { serverID: guild.id, channelID: channel.id },
    });

    if (existing) {
        await channel.messages.delete(existing.messageID).catch((err) => handleError(err));
        await getDatabase().updateLastLockStatusMessage(guild.id, channel.id, messageId);
    }
    else
        await getDatabase().registerLastLockStatusMessage(guild.id, guild.name, channel.id, channel.name, messageId);
}

/**
 * Posts a fresh channel status message after a lock/unlock, replacing the previous one.
 * Never throws: a failed status update must not break the command that triggered it.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction The interaction of the calling command.
 */
async function postChannelStatus(interaction) {
    try {
        const statusEmbed = await buildStatusEmbed(interaction.guild.id, interaction.channel.id, channelFooter);
        const message = await interaction.channel.send({ embeds: [statusEmbed] });
        await replaceStatusMessage(interaction.guild, interaction.channel, message.id);
    }
    catch (err) {
        handleError(err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Show which objects are locked on this channel, or on the whole server.')
        .setContexts(InteractionContextType.Guild)
        .addBooleanOption(option =>
            option.setName('server')
                .setDescription('Show the locked objects of the whole server instead of this channel only.')
                .setRequired(false)),
    postChannelStatus,
    async execute(interaction) {
        const serverWide = interaction.options.getBoolean('server') ?? false;
        await interaction.deferReply(serverWide ? { flags: MessageFlags.Ephemeral } : {});

        const statusEmbed = serverWide
            ? await buildStatusEmbed(interaction.guild.id, null, serverFooter)
            : await buildStatusEmbed(interaction.guild.id, interaction.channel.id, channelFooter);
        const message = await interaction.editReply({ embeds: [statusEmbed] });

        if (serverWide)
            return;
        try {
            await replaceStatusMessage(interaction.guild, interaction.channel, message.id);
        }
        catch (err) {
            handleError(err);
        }
    },
};
