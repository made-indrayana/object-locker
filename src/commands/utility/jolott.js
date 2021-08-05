const embed = require('../../utility/embed');
// const { errorTitle, autoDeleteDelay } = require('../../../config.json');

module.exports = {
    name: 'jolott',
    args: false,
    description: 'Hi Jolott.',
    async execute(message) {
        message.channel.send(embed('jolott says:', 'y tho', 'error', false));
    },
};
