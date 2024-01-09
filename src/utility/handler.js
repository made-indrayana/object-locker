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
// async function handleMessageDelete(message, timeoutMultiplier = 1) {
//     switch (message.channel.type) {
//     case'group_dm':
//     case 'dm': {
//         const promise = new Promise((resolve) => resolve('Message in DM, will not be deleted.'));
//         return promise;
//     }
//     default: {
//         await sleep(config.autoDeleteDelay * timeoutMultiplier);
//         const promise = message.delete()
//             .catch((err) => handleError(err));
//         return promise;
//     }
//     }
// }

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

function embed(title, content, color = 'default', useDefaultFooter = true, customFooter = null) {
    const finalColor = getColor(color);
    const object = new Discord.EmbedBuilder()
        .setTitle(title)
        .setColor(finalColor)
        .setDescription(content);
    if(useDefaultFooter | customFooter === null | customFooter === '')
        object.setFooter({ text: `This message will be automatically deleted after ${config.autoDeleteDelay / 1000} seconds.` });
    else
        object.setFooter({ text: customFooter });
    return object;
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
    embed, sendMessage,
};