const { prefix, errorTitle, autoDeleteDelay } = require('../../../config.json');
const database = require('../../database');
const embed = require('../../utility/embed');
const lockstatus = require('./lockstatus');

const commandName = 'lock';

module.exports = {
    name: commandName,
    description: 'Use command to lock object on the channel.',
    aliases: ['block'],
    usage: [`\`${prefix}${commandName} sceneName\``, `\`${prefix}${commandName} sceneName01 sceneName02\``],
    args: true,
    guildOnly: true,
    async execute(message, args) {
        for (let i = 0; i < args.length; i++) {
            const result = await database.Entry.findOne({
                where: {
                    serverID: message.guild.id,
                    channelID: message.channel.id,
                    lockedObject: database.instance.where(
                        database.instance.fn('LOWER', database.instance.col('lockedObject')), 'IS', args[i].toLowerCase()),
                },
            });

            if (result != null) {
                message.channel.send(embed(errorTitle, `\`${result.lockedObject}\` is already locked by <@${result.userID}>!`, 'error'))
                    .then((msg) => msg.delete({ timeout: autoDeleteDelay }).catch(() => {}));
                message.delete({ timeout: autoDeleteDelay }).catch(() => {});

            }

            else if(result === null) {
                database.createEntry(
                    message.guild.id,
                    message.channel.id,
                    message.author.id,
                    args[i],
                );
                message.channel.send(embed('Locked!', `\`${args[i]}\` is now locked!`, 'success'))
                    .then((msg) => msg.delete({ timeout: autoDeleteDelay }).catch(() => {}));
                message.delete({ timeout: autoDeleteDelay }).catch(() => {});
            }
        }
        lockstatus.execute(message, [undefined]);
    },
};
