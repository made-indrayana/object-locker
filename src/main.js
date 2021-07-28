const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

const { Sequelize, Op, Model, DataTypes } = require('sequelize');
const config = require('../config.json');
const prefix = config.prefix;

const sequelize = new Sequelize(
	{
		dialect: 'sqlite',
		storage: 'database.sqlite',
	},
);

class Entry extends Model {}
Entry.init(
	{
		serverID: { type: DataTypes.STRING, allowNull: false },
		channelID: { type: DataTypes.STRING, allowNull: false },
		userID: { type: DataTypes.STRING, allowNull: false },
		lockedObject: { type: DataTypes.STRING, allowNull: false },
	},
	{
		sequelize,
		modelName: 'Entry',
	},
);

async function ValidateDatabase(database) {
	try {
		await sequelize.authenticate(database);
		await database.sync({ force:true });
		console.log('Connection has been established successfully.');
	}
	catch (error) {
		console.error('Unable to connect to the database: ', error);
	}
}

async function CreateEntry(serverID, channelID, userID, objectName) {
	try {
		await Entry.create({
			serverID: serverID,
			channelID: channelID,
			userID: userID,
			lockedObject: objectName,
		});
	}
	catch (error) {
		console.error('Unable to create entry: ', error);
	}
}

client.on('ready', () => {
	console.log('Bot "Object Locker" has been started!');
});

ValidateDatabase(sequelize);

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot)
		return;

	else if (message.content.startsWith(prefix)) {
		const rawInput = message.content.slice(1, message.content.length);
		const input = rawInput.split(' ');
		// removes the first item in an array and returns that item
		const commandName = input.shift().toLowerCase();

		if (!client.commands.has(commandName)) return;

		try {
			client.commands.get(commandName).execute(message, input);
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}

		if (input.length > 1)
			message.channel.send('Too many arguments, please only use one argument.');

	}
});

client.login(config.token);
