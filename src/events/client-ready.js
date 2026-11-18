const { Events } = require('discord.js');
const database = require('../database');
const { log, logError, Log } = require('../utility/log');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        log(`Bot ${client.user.tag} has been started!`, Log.bg.green);
        try {
            await database.validateDatabase();
        }
        catch (err) {
            logError(`Database is not usable, shutting down: ${err.message}`);
            client.destroy();
            process.exitCode = 1;
        }
    },
};
