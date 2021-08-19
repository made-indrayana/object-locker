// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
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

/**
 * @param {Discord.Message} message Message object to be deleted.
 * @param {number} timeoutMultiplier Multplies the defined auto delete message's delay.
 */
async function handleMessageDelete(message, timeoutMultiplier = 1) {
    switch (message.channel.type) {
    case'group_dm':
    case 'dm': {
        const promise = new Promise((resolve) => resolve('Message in DM, will not be deleted.'));
        return promise;
    }
    default: {
        const promise = message.delete({ timeout: config.autoDeleteDelay * timeoutMultiplier })
            .catch((err) => handleError(err));
        return promise;
    }
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
        return identifier;
    }
}

function embed(title, content, color = 'default', useDefaultFooter = true, customFooter = '') {
    const finalColor = getColor(color);
    const object = new Discord.MessageEmbed()
        .setTitle(title)
        .setColor(finalColor)
        .setDescription(content);
    if(useDefaultFooter && customFooter === '')
        object.setFooter(`This message will be automatically deleted after ${config.autoDeleteDelay / 1000} seconds.`);
    else
        object.setFooter(customFooter);
    return object;
}

/**
 * @param {Discord.Message} message Message object, needed to be able to handle message deletion correctly.
 * @param {string} title Embed title.
 * @param {string} content Embed content.
 * @param {string} color Embed color defined in config.json OR custom color in hex.
 * @param {string} customFooter Content of custom footer if use custom footer is set to true.
 */
async function sendEmbedMessage(message, title, content, color = 'default', useDefaultFooter = true, customFooter = '') {

    if(message.channel.type === ('dm' || 'group_dm'))
        useDefaultFooter = false;

    const promise = message.channel.send(embed(title, content, color, useDefaultFooter, customFooter))
        .then((botMessage) => handleMessageDelete(botMessage))
        .catch((err) => handleError(err));

    return promise;
}
/**
 * @param {Discord.Message} message Message object, needed to be able to handle message deletion correctly.
 * @param {Discord.MessageEmbed | string} object A string or MessageEmbed object to be sent to the channel.
 */
async function sendMessage(message, object, autoDelayMultiplier = 1) {

    const promise = message.channel.send(object)
        .then((botMessage) => handleMessageDelete(botMessage, autoDelayMultiplier))
        .catch((err) => handleError(err));

    return promise;
}

module.exports = {
    parseError, handleError,
    handleMessageDelete,
    embed, sendEmbedMessage, sendMessage,
};