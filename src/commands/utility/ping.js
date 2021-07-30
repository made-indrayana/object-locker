const embed = require('../../utilities/embed');

module.exports = {
    name: 'ping',
    args: false,
    description: 'Ping!',
    execute(message) {
        message.channel.send(embed('...Pong!', 'I\'m alive!'));
    },
};