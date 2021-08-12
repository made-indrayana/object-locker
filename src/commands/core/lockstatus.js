const database = require('../../database');
const embed = require('../../utility/embed');
const { prefix, autoDeleteDelay } = require('../../../config.json');
const delayMultiplier = 1;

const commandName = 'lockstatus';

async function handleLockStatusMessages(message, lockmessage) {
    const result = await database.LockStatusMessages.findOne({
        where: { serverID: message.guild.id, channelID: message.channel.id },
    });

    if (result != null) {
        message.channel.messages.fetch(result.messageID)
            .then((msg) => msg.delete().catch((err) => console.error(err)))
            .catch((err) => console.error(err));
        database.updateLastLockStatusMessage(message.guild.id, message.channel.id, lockmessage.id);
    }
    else
        database.registerLastLockStatusMessage(message.guild.id, message.channel.id, lockmessage.id);

}

module.exports = {
    name: commandName,
    description: 'Show lock status on the channel. Server wide lock status with `server` argument.',
    aliases: ['status', 'ls'],
    usage: [`\`${prefix}${commandName}\``, `\`${prefix}${commandName} server\``],
    args: false,
    guildOnly: true,
    async execute(message, args) {
        if (args[0] === undefined) {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id, channelID: message.channel.id },
            });

            let strings = [];
            if (results.length != 0) {
                results.forEach((entry) =>
                    strings.push(`<@${entry.userID}> is locking \`${entry.lockedObject}\``),
                );
            }

            if (results.length === 0)
                strings = 'No object is currently locked.';
            if (results.length > 1)
                embedTitle += 's';
            message.channel.send(embed(embedTitle, strings, 'default', false))
                .then((lockmessage) => handleLockStatusMessages(message, lockmessage));
        }
        else if (args[0] === 'server') {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id },
            });
            let strings = [];
            if (results.length != 0) {
                results.forEach((entry) =>
                    strings.push(
                        `<@${entry.userID}> is locking \`${entry.lockedObject}\` in <#${entry.channelID}>`,
                    ),
                );
            }

            if (results.length === 0)
                strings = 'No object is currently locked.';
            if (results.length > 1)
                embedTitle += 's';
            message.channel.send(embed(embedTitle, strings, 'default', false))
                .then((lockmessage) => handleLockStatusMessages(message, lockmessage));
        }

        message.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {});
    },
};
