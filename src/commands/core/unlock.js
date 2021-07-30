const config = require('../../../config.json');
const database = require('../../database');
const embed = require('../../utilities/embed');

module.exports = {
    name: 'unlock',
    args: true,
    usage: 'objectNameToUnlock',
    description: 'Unlock Object.',
    async execute(message, args) {
        if (args.length > 1) {
            let reply = 'Too many arguments, please use only one argument.';
            reply += `\nThe proper usage would be: \`${config.prefix}${this.name} ${this.usage}\``;
            message.channel.send(embed.create('Error', reply, 'error'));
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
            message.channel.send(embed.create('Unlocked!', `\`${args[0]}\` is now unlocked!`));
        }
        else
            message.channel.send(embed.create('Error', `\`${args[0]}\` is not locked!`, 'error'));

    },
};
