const Discord = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const config = require('../../config.json');
const { logError } = require('./log');

function parseError(err, printLog = false) {
    let errorString = `${err.name}: ${err.message}`;
    errorString += `\nError Code: ${err.code}`;
    errorString += `\nMethod: ${err.method}`;
    if(printLog)
        logError(errorString);
    return errorString;
}

function handleError(err) {
    switch (err.code) {
    case 50034:
        logError(`${err.message}`);
        break;
    case 50003:
        logError(`Cannot execute ${err.method} in a DM channel. `);
        break;
    case 10008:
        logError(`Could not find message to ${err.method}.`);
        break;
    default:
        parseError(err, true);
        break;
    }
}

function getColor(identifier) {
    switch(identifier) {
    case 'default':
        return config.defaultColor;
    case 'success':
        return config.successColor;
    case 'warning':
        return config.warningColor;
    case 'error':
        return config.errorColor;
    default:
        return config.defaultColor;
    }
}

/**
 * @param {string} title Embed title.
 * @param {string} content Embed description.
 * @param {string} color One of 'default', 'success', 'warning', 'error'.
 * @param {boolean} useDefaultFooter Show the "automatically deleted" footer (ignored when customFooter is given).
 * @param {string | null} customFooter Footer text that takes priority over the default footer.
 */
function embed(title, content, color = 'default', useDefaultFooter = true, customFooter = null) {
    const object = new Discord.EmbedBuilder()
        .setTitle(title)
        .setColor(getColor(color))
        .setDescription(content);
    if (customFooter)
        object.setFooter({ text: customFooter });
    else if (useDefaultFooter)
        object.setFooter({ text: `This message will be automatically deleted after ${config.autoDeleteDelay / 1000} seconds.` });
    return object;
}

/**
 * Deletes the interaction's reply after the configured delay. Do not await it unless you want to block on the delay;
 * errors (e.g. the reply was already deleted by a user) are handled here.
 * @param {Discord.ChatInputCommandInteraction} interaction Interaction that has already been replied to.
 * @param {number} timeoutMultiplier Multiplies the configured auto delete delay.
 */
async function autoDeleteReply(interaction, timeoutMultiplier = 1) {
    await wait(config.autoDeleteDelay * timeoutMultiplier);
    try {
        await interaction.deleteReply();
    }
    catch (err) {
        handleError(err);
    }
}

/**
 * Splits a space separated string into object names, dropping empty entries and case-insensitive duplicates.
 * @param {string | null} input Raw command option value.
 * @returns {string[]} Unique object names in the order they were given.
 */
function parseObjectNames(input) {
    const names = new Map();
    (input ?? '').split(/\s+/).filter(Boolean).forEach((name) => {
        if (!names.has(name.toLowerCase()))
            names.set(name.toLowerCase(), name);
    });
    return [...names.values()];
}

module.exports = {
    parseError, handleError,
    embed, autoDeleteReply, parseObjectNames,
};
