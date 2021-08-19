const { prefix, errorTitle } = require('../../../config.json');

const database = require('../../database');
const lockstatus = require('./lockstatus');

const { sendEmbedMessage, handleError, handleMessageDelete } = require('../../utility/handler');

const commandName = 'unlock';

module.exports = {
    name: commandName,
    description: 'Use command to lock object on the channel.',
    aliases: ['unblock', 'release'],
    usage: [`\`${prefix}${commandName}\` > will unlock *all* of your locked objects!`,
        `\`${prefix}${commandName} sceneName\``,
        `\`${prefix}${commandName} sceneName01 sceneName02\``],
    args: false,
    guildOnly: true,
    async execute(message, args) {

        // IF THERE'S NO ARGUMENT, DO THE FOLLOWING:

        if (!args.length) {
            database.destroyAllEntryFromUser(message.guild.id, message.channel.id, message.author.id)
                .then((promise) => {
                    switch(promise) {
                    case 0:
                        sendEmbedMessage(message, errorTitle, 'You currently have no object locked!', 'error');
                        break;
                    default: {
                        let objectString = 'object';
                        if(promise > 1)
                            objectString += 's';
                        sendEmbedMessage(message, 'Unlocked!', `You have successfully unlocked \`${promise}\` ${objectString}!`, 'success');
                        break;
                    }
                    }
                })
                .catch((err) => handleError(err));
        }

        // IF THERE'S AN ARGUMENT, DO THE FOLLOWING:

        else {
            for (let i = 0; i < args.length; i++) {
                database.destroyEntry(message.guild.id, message.channel.id, args[i])
                    .then((promise) => {
                        switch(promise) {
                        case 0:
                            sendEmbedMessage(message, errorTitle, `\`${args[i]}\` is not locked!`, 'error');
                            break;
                        default:
                            sendEmbedMessage(message, 'Unlocked!', `\`${args[i]}\` is unlocked!`, 'success');
                            break;
                        }
                    })
                    .catch((err) => handleError(err));
            }
        }
        handleMessageDelete(message);
        lockstatus.execute(message, [], true);
    },
};
