const database = require('../../database');
const embed = require('../../utilities/embed');

module.exports = {
    name: 'lock',
    args: true,
    description: 'Lock Object.',
    async execute(message, args) {
        const result = await database.Entry.findOne({
            where: {
                serverID: message.guild.id,
                channelID: message.channel.id,
                lockedObject: args[0],
            },
        });

        if (result != null)
            message.channel.send(`\`${args[0]}\` is already locked!`);

        else if(result === null) {
            database.createEntry(
                message.guild.id,
                message.channel.id,
                message.author.id,
                args[0],
            );
            message.channel.send(embed.create('Locked!', `\`${args[0]}\` is now locked!`));
        }
    },
};
