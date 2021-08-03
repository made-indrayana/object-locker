const { prefix, errorTitle, autoDeleteDelay } = require('../../../config.json');
const database = require('../../database');
const embed = require('../../utility/embed');

module.exports = {
    name: 'unlock',
    description: 'Use command to lock object on the channel.',
    aliases: ['unblock', 'release'],
    usage: ['objectNameToLock', 'sceneName', 'prefabName'],
    args: true,
    guildOnly: true,
    async execute(message, args) {
        if (args.length > 1) {
            let reply = 'Too many arguments, please use only one argument.';
            reply += `\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``;
            message.channel.send(embed(errorTitle, reply, 'error'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            message.delete({ timeout: autoDeleteDelay });
            return;
        }

        const result = await database.Entry.findOne({
            where: {
                serverID: message.guild.id,
                channelID: message.channel.id,
                lockedObject: args[0],
            },
        });
        if (result != null) {
            // eslint-disable-next-line no-unused-vars
            const destroy = await database.destroyEntry(message.guild.id, message.channel.id, args[0]);
            message.channel.send(embed('Unlocked!', `\`${args[0]}\` is now unlocked!`, 'success'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            message.delete({ timeout: autoDeleteDelay });

        }
        else {
            message.channel.send(embed(errorTitle, `\`${args[0]}\` is not locked!`, 'error'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            message.delete({ timeout: autoDeleteDelay });

        }
    },
};
