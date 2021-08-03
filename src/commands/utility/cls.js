const embed = require('../../utility/embed');
const { errorTitle } = require('../../../config.json');

module.exports = {
    name: 'cls',
    args: false,
    description: 'Clear the last 100 messages.',
    async execute(message) {
        if(message.channel.type === 'dm')
            message.reply(embed(errorTitle, 'I can\'t clear DMs! :(', 'error'));
        else if(message.guild.member(message.author).hasPermission('ADMINISTRATOR'))
            message.channel.bulkDelete(100);
        else
            message.reply(embed(errorTitle, 'You can\'t clear messages in a channel if you\'re not an Admin!', 'error'));
    },
};
