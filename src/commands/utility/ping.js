const embed = require('../../utility/embed');
const { autoDeleteDelay } = require('../../../config.json');

module.exports = {
    name: 'ping',
    args: false,
    description: 'Ping!',
    execute(message) {
        message.channel.send(embed('...Pong!', 'I\'m alive!'))
            .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
        message.delete({ timeout: autoDeleteDelay });
    },
};
