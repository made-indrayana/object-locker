const { prefix } = require('../../../config.json');
const database = require('../../database');
const { embed, handleError, handleMessageDelete } = require('../../utility/handler');

const commandName = 'lockstatus';

async function handleLockStatusMessages(message, lockmessage) {
    const result = await database.LockStatusMessages.findOne({
        where: { serverID: message.guild.id, channelID: message.channel.id },
    });
    if (result != null) {
        message.channel.messages.fetch(result.messageID)
            .then((msg) => handleMessageDelete(msg, 0))
            .catch((err) => handleError(err));
        database.updateLastLockStatusMessage(message.guild.id, message.channel.id, lockmessage.id)
            .catch((err) => handleError(err));
    }
    else {
        database.registerLastLockStatusMessage(message.guild.id, message.guild.name, message.channel.id, message.channel.name, lockmessage.id)
            .catch((err) => handleError(err));
    }
}

module.exports = {
    name: commandName,
    description: 'Show lock status on the channel. Server wide lock status with `server` argument.',
    aliases: ['status', 'ls'],
    usage: [`\`${prefix}${commandName}\``, `\`${prefix}${commandName} server\``],
    args: false,
    guildOnly: true,
    async execute(message, args, calledFromScript = false) {

        // IF THERE IS NO ARGUMENT, DO THIS:

        if (!args.length) {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id, channelID: message.channel.id },
            });

            let strings = [];

            if (results.length != 0) {
                for(let i = 0; i < results.length; i++)
                    strings.push(`<@${results[i].userID}> is locking \`${results[i].lockedObject}\``);
                if (results.length > 1)
                    embedTitle += 's';
            }
            else if (results.length === 0)
                strings = 'No object is currently locked.';

            message.channel.send(embed(embedTitle, strings, 'default', false).setFooter('This message will persist until the next status message is issued.'))
                .then((lockmessage) => handleLockStatusMessages(message, lockmessage));
        }

        // IF THE ARGUMENT IS 'SERVER', DO THIS:

        else if (args[0] === 'server') {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id },
            });
            let strings = [];

            if (results.length != 0) {
                for(let i = 0; i < results.length; i++)
                    strings.push(`<@${results[i].userID}> is locking \`${results[i].lockedObject}\` in <#${results[i].channelID}>`);
                if (results.length > 1)
                    embedTitle += 's';
            }

            if (results.length === 0)
                strings = 'No object is currently locked.';
            message.channel.send(embed(embedTitle, strings, 'default', false).setFooter('This message will persist until the next status message is issued.'))
                .then((lockmessage) => handleLockStatusMessages(message, lockmessage));
        }

        // IF THIS COMMAND IS NOT CALLED FROM OTHER SCRIPT, DELETE DISCORD'S CALLING MESSAGE

        if (!calledFromScript) {
            handleMessageDelete(message)
                .catch((err) => handleError(err));
        }
    },
};
