const fs = require('fs');
const token = require('../token.json');
const { prefix, warningTitle, errorTitle, autoDeleteDelay } = require('../config.json');
const about = require('./utility/about-text');
const database = require('./database');
const embed = require('./utility/embed');

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

client.on('guildCreate', async (guild) => {
    client.users.fetch(guild.ownerID)
        .then((user) => user.send(about))
        .catch((err) => console.log(err));
});

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    else if (message.content.startsWith(prefix)) {
        const rawInput = message.content.slice(1, message.content.length);
        const args = rawInput.split(' ');
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
            return;

        if (command.guildOnly && message.channel.type === 'dm')
            return message.reply(embed(errorTitle, 'I can\'t do it in a DM :(\nPlease execute this in a channel.', 'error'));

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if(command.usage) {
                reply += '\nThe proper usage would be:';
                for(let i = 0; i < command.usage.length; i++)
                    reply += `\n\`${command.usage[i]}\``;
            }
            message.channel.send(embed(warningTitle, reply, 'warning'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            return message.delete({ timeout: autoDeleteDelay });
        }

        try {
            command.execute(message, args);
        }
        catch (error) {
            console.error(error);
            message.reply(embed(errorTitle, `there was an error trying to execute that command!\nError message: \`${error}\``, 'error'))
                .then((msg) => msg.delete({ timeout: autoDeleteDelay }));
            message.delete({ timeout: autoDeleteDelay });
        }
    }
});

client.login(token.id);
