const about = require('../../utility/about-text');
const { autoDeleteDelay } = require('../../../config.json');
const delayMultiplier = 3;

module.exports = {
    name: 'about',
    args: false,
    description: 'About me :nerd:',
    async execute(message) {
        if(message.channel.type === 'dm')
            message.channel.send(about);

        else {
            message.channel.send(about)
                .then((msg) => msg.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {}));
            message.delete({ timeout: autoDeleteDelay * delayMultiplier }).catch(() => {});
        }

    },
};
