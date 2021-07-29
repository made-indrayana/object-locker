const fs = require('fs');
const config = require('../config.json');
const prefix = config.prefix;
const database = require('./database');

// Discord
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Parsing commands
const commandFolders = fs.readdirSync('src/commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`src/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.on('ready', () => {
	console.log('Bot "Object Locker" has been started!');
	database.validateDatabase(database.instance);
});

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot)
		return;

	else if (message.content.startsWith(prefix)) {
		const rawInput = message.content.slice(1, message.content.length);
		const args = rawInput.split(' ');
		// removes the first item in an array and returns that item
		const commandName = args.shift().toLowerCase();

		if (!client.commands.has(commandName)) return;

		if (commandName.args && !args.length)
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);

		if (args.length > 1) {
			message.channel.send('Too many arguments, please only use one argument.');
			return;
		}

		try {
			client.commands.get(commandName).execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.reply(`there was an error trying to execute that command!\nError message: \`${error}\``);
		}
	}
});

client.login(config.token);
