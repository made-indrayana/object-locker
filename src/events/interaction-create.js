const { Events, MessageFlags } = require('discord.js');

const errorReply = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };

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
                await interaction.followUp(errorReply);

            else
                await interaction.reply(errorReply);

        }
    },
};
