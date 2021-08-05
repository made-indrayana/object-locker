const { prefix, errorTitle, autoDeleteDelay } = require('../../../config.json');
const database = require('../../database');
const embed = require('../../utility/embed');

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
        let hasBeenDeleted = false;

        // IF THERE'S NO ARGUMENT, DO THE FOLLOWING

        if(args.length === 0) {
            const result = await database.Entry.findAll({
                where: {
                    serverID: message.guild.id,
                    channelID: message.channel.id,
                    userID: message.author.id,
                },
            });

            if(result.length === 1) {
                // eslint-disable-next-line no-unused-vars
                const destroy = await database.destroyEntry(message.guild.id, message.channel.id, result[0].lockedObject);
                message.channel.send(embed('Unlocked!', `\`${result[0].lockedObject}\` is now unlocked!`, 'success'))
                    .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
                if(!hasBeenDeleted) {
                    message.delete({ timeout: autoDeleteDelay });
                    hasBeenDeleted = true;
                }
            }

            else if(result.length > 1) {
                for(let i = 0; i < result.length; i++) {
                    // eslint-disable-next-line no-unused-vars
                    const destroy = await database.destroyEntry(message.guild.id, message.channel.id, result[i].lockedObject);
                    message.channel.send(embed('Unlocked!', `\`${result[i].lockedObject}\` is now unlocked!`, 'success'))
                        .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
                    if(!hasBeenDeleted) {
                        message.delete({ timeout: autoDeleteDelay });
                        hasBeenDeleted = true;
                    }
                }
            }

            else {
                message.channel.send(embed(errorTitle, 'You currently have no object locked!', 'error'))
                    .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
                if(!hasBeenDeleted) {
                    message.delete({ timeout: autoDeleteDelay });
                    hasBeenDeleted = true;
                }
            }
        }

        // IF THERE'S AN ARGUMENT, DO THE FOLLOWING:

        else if(args.length >= 1) {
            for (let i = 0; i < args.length; i++) {
                const result = await database.Entry.findOne({
                    where: {
                        serverID: message.guild.id,
                        channelID: message.channel.id,
                        lockedObject: args[i],
                    },
                });

                if (result != null) {
                // eslint-disable-next-line no-unused-vars
                    const destroy = await database.destroyEntry(message.guild.id, message.channel.id, args[0]);
                    message.channel.send(embed('Unlocked!', `\`${args[i]}\` is now unlocked!`, 'success'))
                        .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
                    if(!hasBeenDeleted) {
                        message.delete({ timeout: autoDeleteDelay });
                        hasBeenDeleted = true;
                    }
                }
                else {
                    message.channel.send(embed(errorTitle, `\`${args[i]}\` is not locked!`, 'error'))
                        .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
                    if(!hasBeenDeleted) {
                        message.delete({ timeout: autoDeleteDelay });
                        hasBeenDeleted = true;
                    }
                }
            }
        }
    },
};
