require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Removes every slash command of the bot, both in the guild from GUILD_ID and global ones.
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
        console.log('Successfully deleted all guild commands.');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('Successfully deleted all global commands.');
    }
    catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
})();
