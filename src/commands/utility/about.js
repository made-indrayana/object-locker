const about = require('../../utility/about-text');
const { autoDeleteDelay } = require('../../../config.json');

module.exports = {
    name: 'about',
    args: false,
    description: 'About me :nerd:',
    async execute(message) {
        message.channel.send(about)
            .then((msg) => msg.delete({ timeout: autoDeleteDelay * 6 * 5 }));
    },
};
