const about = require('../../utility/about-text');
const { sendMessage, handleMessageDelete } = require('../../utility/handler');

const delayMultiplier = 6;

module.exports = {
    name: 'about',
    args: false,
    description: 'About me :nerd:',
    async execute(message) {
        sendMessage(message, about, delayMultiplier);
        handleMessageDelete(message, delayMultiplier);
    },
};
