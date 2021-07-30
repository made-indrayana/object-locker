const { prefix, helpTitle, defaultColor } = require('../../../config.json');
const embed = require('../../utilities/embed');
const Discord = require('discord.js');
const ignoreCommands = ['cls', 'help', 'ping'];

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands', '!'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const { commands } = message.client;
        const helpEmbed = new Discord.MessageEmbed();

        if (!args.length) {
            commands.forEach((command) => {
                if(ignoreCommands.includes(command.name))
                    return;
                const commandDesc = [];
                commandDesc.push(command.description);
                commandDesc.push(command.usage);
                helpEmbed.addField(`\`${prefix}${command.name}\``, commandDesc, true);
            });

            helpEmbed.setTitle(helpTitle);
            helpEmbed.setDescription('Here\'s a list of what I can help you with:');
            helpEmbed.setColor(defaultColor);
            helpEmbed.setFooter(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);
            return message.channel.send(helpEmbed);
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command)
            return message.reply('that\'s not a valid command!');

        helpEmbed.setTitle(helpTitle);
        helpEmbed.setDescription(
            `\`${prefix}${command.name}\`
            Alts: \`${command.aliases}\`
            ${command.description}
            Usage: \`${prefix}${command.name} ${command.usage}\``);
        helpEmbed.setColor(defaultColor);

        message.channel.send(helpEmbed);
    },
};
