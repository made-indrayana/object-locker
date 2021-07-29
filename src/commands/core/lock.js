const database = require('../../database');

module.exports = {
	name: 'lock',
	args: true,
	description: 'Lock Object.',
	async execute(message, args) {
		database.createEntry(
			message.guild.id,
			message.channel.id,
			message.author.id,
			args[0],
		);
		message.channel.send(`\`${args[0]}\` is now locked!`);
	},
};
