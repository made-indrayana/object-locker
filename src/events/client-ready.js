const { Events } = require('discord.js');
const database = require('../database');
const { log, Log } = require('../utility/log');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        log(`Bot ${client.user.tag} has been started!`, Log.bg.green);
        database.validateDatabase(database.instance);
    },
};
