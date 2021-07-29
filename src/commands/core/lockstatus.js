const Discord = require('discord.js');
const database = require('../../database');

module.exports = {
	name: 'lockstatus',
	args: false,
	description: 'Show lock status on the channel/server.',
	async execute(message, args) {
		if (args[0] === undefined) {
			const results = await database.Entry.findAll({
				where: { serverID: message.guild.id, channelID: message.channel.id },
			});
			let strings = new Array();
			results.forEach((entry) =>
				strings.push(`<@${entry.userID}> is locking \`${entry.lockedObject}\``),
			);

			if (strings[0] == null) strings = 'No object is currently locked.';
			const embed = new Discord.MessageEmbed()
				.setTitle('Locked Object')
				.setColor('2f4c90')
				.setDescription(strings);
			message.channel.send(embed);
		}
		else if (args[0] === 'all') {
			const results = await database.Entry.findAll({
				where: { serverID: message.guild.id },
			});
			let strings = new Array();
			results.forEach((entry) =>
				strings.push(
					`<@${entry.userID}> is locking \`${entry.lockedObject}\` in <#${entry.channelID}>`,
				),
			);

			if (strings[0] == null) strings = 'No object is currently locked.';
			const embed = new Discord.MessageEmbed()
				.setTitle('Locked Object')
				.setColor('2f4c90')
				.setDescription(strings);
			message.channel.send(embed);
		}
	},
};
