const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred)
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });

            else
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });

        }
    },
};

// client.on(Discord.Events.MessageCreate, async (message) => {
//     if (!message.content.startsWith(prefix) || message.author.bot)
//         return;

//     else if (message.content.startsWith(prefix)) {
//         const rawInput = message.content.slice(1, message.content.length);
//         const args = rawInput.split(' ');
//         const commandName = args.shift().toLowerCase();

//         const command = client.commands.get(commandName)
//         || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

//         if (!command)
//             return;

//         if (command.guildOnly && message.channel.type === 'dm')
//             return message.reply(embed(errorTitle, 'I can\'t do it in a DM :(\nPlease execute this in a channel.', 'error', false));

//         if (command.args && !args.length) {
//             let reply = `You didn't provide any arguments, ${message.author}!`;
//             if(command.usage) {
//                 reply += '\nThe proper usage would be:';
//                 for(let i = 0; i < command.usage.length; i++)
//                     reply += `\n\`${command.usage[i]}\``;
//             }
//             // message.channel.send(embed(warningTitle, reply, 'warning'))
//             //     .then((msg) => msg.delete({ timeout: autoDeleteDelay }).catch((err) => handleError(err)));
//             // return message.delete({ timeout: autoDeleteDelay }).catch((err) => handleError(err));

//             sendEmbedMessage(message, warningTitle, reply, 'warning');
//             handleMessageDelete(message);

//             return;
//         }

//         try {
//             command.execute(message, args);
//         }
//         catch (error) {
//             log(error, Log.fg.red);
//             message.reply(embed(errorTitle, `there was an error trying to execute that command!\nError message: \`${error}\``, 'error'))
//                 .then((msg) => msg.delete({ timeout: autoDeleteDelay }).catch((err) => handleError(err)));
//             message.delete({ timeout: autoDeleteDelay }).catch((err) => handleError(err));
//         }
//     }
// });