require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Usage: node src/deploy-commands.js [--global]
// Without --global the commands are registered only in the guild from GUILD_ID (instant, for development).
// With --global they are registered for every guild the bot is in. Don't use both for the same bot, or users will see each command twice.
const isGlobal = process.argv.includes('--global');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command)
            commands.push(command.data.toJSON());

        else
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);

    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands (${isGlobal ? 'global' : 'guild only'}).`);

        const route = isGlobal
            ? Routes.applicationCommands(process.env.CLIENT_ID)
            : Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);
        const data = await rest.put(route, { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
})();
