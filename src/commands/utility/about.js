const about = require('../../utility/about-text');

module.exports = {
    name: 'about',
    args: false,
    description: 'About me :nerd:',
    async execute(message) {
        message.channel.send(about);
    },
};
