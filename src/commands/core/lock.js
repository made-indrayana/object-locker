const { prefix, errorTitle } = require('../../../config.json');
const database = require('../../database');
const embed = require('../../utilities/embed');

module.exports = {
    name: 'lock',
    description: 'Use command to lock object on the channel.',
    aliases: ['block'],
    usage: ['objectNameToLock', 'sceneName', 'prefabName'],
    args: true,
    guildOnly: true,
    async execute(message, args) {
        if (args.length > 1) {
            let reply = 'Too many arguments, please use only one argument.';
            reply += `\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``;
            message.channel.send(embed(errorTitle, reply, 'error'));
            return;
        }

        const result = await database.Entry.findOne({
            where: {
                serverID: message.guild.id,
                channelID: message.channel.id,
                lockedObject: args[0],
            },
        });

        if (result != null)
            message.channel.send(embed(errorTitle, `\`${args[0]}\` is already locked by <@${result.userID}>!`, 'error'));

        else if(result === null) {
            database.createEntry(
                message.guild.id,
                message.channel.id,
                message.author.id,
                args[0],
            );
            message.channel.send(embed('Locked!', `\`${args[0]}\` is now locked!`, 'success'));
        }
    },
};
