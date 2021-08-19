const { sendEmbedMessage, handleError, handleMessageDelete } = require('../../utility/handler');
const { errorTitle } = require('../../../config.json');

module.exports = {
    name: 'cls',
    args: false,
    description: 'Clear the last 100 messages.',
    async execute(message) {
        if(message.channel.type === 'dm')
            sendEmbedMessage(message, errorTitle, 'I can\'t clear DMs! :(', 'error');
        else if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
            message.channel.bulkDelete(100)
                .catch((err) => handleError(err));
        }
        else {
            sendEmbedMessage(message, errorTitle, 'You can\'t clear messages in a channel if you\'re not an Admin!', 'error');
            handleMessageDelete(message);
        }
    },
};
