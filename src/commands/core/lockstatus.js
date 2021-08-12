const database = require('../../database');
const embed = require('../../utility/embed');
const { prefix, autoDeleteDelay } = require('../../../config.json');
const delayMultiplier = 1;

const commandName = 'lockstatus';

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
            message.channel.send(embed(embedTitle, strings))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {}));
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
            message.channel.send(embed(embedTitle, strings))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {}));
        }

        message.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {});
    },
};
