const { sendEmbedMessage, handleMessageDelete } = require('../../utility/handler');

const commandName = 'ping';

module.exports = {
    name: commandName,
    args: false,
    description: 'Pong!',
    guildOnly: false,
    execute(message) {
        sendEmbedMessage(message, '...Pong!', 'I\'m alive!', 'default', true);
        handleMessageDelete(message);
    },

};

