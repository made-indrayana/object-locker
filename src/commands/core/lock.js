const { prefix, errorTitle } = require('../../../config.json');

const database = require('../../database');
const lockstatus = require('./lockstatus');

const { sendEmbedMessage, handleError, handleMessageDelete } = require('../../utility/handler');

const commandName = 'lock';

module.exports = {
    name: commandName,
    description: 'Use command to lock object on the channel.',
    aliases: ['block'],
    usage: [`\`${prefix}${commandName} sceneName\``, `\`${prefix}${commandName} sceneName01 sceneName02\``],
    args: true,
    guildOnly: true,
    async execute(message, args) {
        const promises = [];
        for (let i = 0; i < args.length; i++) {
            const promise = database.createEntry(
                message.guild.id,
                message.channel.id,
                message.author.id,
                args[i],
            )
                .then(() => {
                    sendEmbedMessage(message, 'Locked!', `\`${args[i]}\` is now locked!`, 'success');
                })
                .catch((err) => {
                    if (err.name === 'SequelizeUniqueConstraintError')
                        sendEmbedMessage(message, errorTitle, `\`${args[i]}\` is already locked!`, 'error');
                    else handleError(err);
                });
            promises.push(promise);
        }
        Promise.allSettled(promises).then(() => {
            handleMessageDelete(message);
            lockstatus.execute(message, [], true);
        });
    },
};
