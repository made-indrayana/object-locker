const database = require('../../database');
const embed = require('../../utilities/embed');

module.exports = {
    name: 'lockstatus',
    description: 'Show lock status on the channel/server.',
    args: false,
    guildOnly: true,
    async execute(message, args) {
        if (args[0] === undefined) {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id, channelID: message.channel.id },
            });

            let strings = new Array();
            if (results.length != 0) {
                results.forEach((entry) =>
                    strings.push(`<@${entry.userID}> is locking \`${entry.lockedObject}\``),
                );
            }

            if (results.length === 0)
                strings = 'No object is currently locked.';
            if (results.length > 1)
                embedTitle += 's';
            message.channel.send(embed(embedTitle, strings));
        }
        else if (args[0] === 'all') {
            let embedTitle = 'Locked Object';
            const results = await database.Entry.findAll({
                where: { serverID: message.guild.id },
            });
            let strings = new Array();
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
            message.channel.send(embed(embedTitle, strings));
        }
    },
};
