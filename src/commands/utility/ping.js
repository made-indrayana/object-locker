const embed = require('../../utility/embed');
const { autoDeleteDelay } = require('../../../config.json');

module.exports = {
    name: 'ping',
    args: false,
    description: 'Pong!',
    guildOnly: false,
    execute(message) {
        if(message.channel.type === 'dm')
            message.channel.send(embed('...Pong!', 'I\'m alive!', 'default', false));
        else {
            message.channel.send(embed('...Pong!', 'I\'m alive!'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            message.delete({ timeout: autoDeleteDelay });
        }

    },
};
