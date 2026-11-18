const { Events } = require('discord.js');
const database = require('../database');
const { handleError } = require('../utility/handler');


module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        try {
            await database.guildDeregister(guild.id);
        }
        catch (err) {
            handleError(err);
        }
    },
};
