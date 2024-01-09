const { Events } = require('discord.js');
const database = require('../database');


module.exports = {
    name: Events.GuildDelete,
    once: true,
    execute(guild) {
        database.guildDeregister(guild.id);
    },
};