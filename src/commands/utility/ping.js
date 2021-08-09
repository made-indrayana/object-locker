const embed = require('../../utility/embed');
const { autoDeleteDelay } = require('../../../config.json');

module.exports = {
    name: 'ping',
    args: false,
    description: 'Pong!',
    guildOnly: false,
    execute(message) {
        message.channel.send(embed('...Pong!', 'I\'m alive!', 'default', false))
            .then((msg) => msg.delete({ timeout: autoDeleteDelay }).catch(() => {}));
        message.delete({ timeout: autoDeleteDelay }).catch(() => {});
    },

};

