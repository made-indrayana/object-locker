const database = require('../../database');

module.exports = {
	name: 'unlock',
	args: true,
	description: 'Unlock Object.',
	async execute(message, args) {
		const result = await database.Entry.findOne({
			where: {
				serverID: message.guild.id,
				channelID: message.channel.id,
				lockedObject: args[0],
			},
		});
		if (result != null) {
			async () => await database.Entry.destroy({
				where: { lockedObject: args[0] },
			});
			message.channel.send(`\`${args[0]}\` is now unlocked!`);
		}
		else
			message.channel.send('Object not locked!');

	},
};
