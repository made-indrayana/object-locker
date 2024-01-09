const { Events } = require('discord.js');
const database = require('../database');
const about = require('../utility/about-text');

const { handleError } = require('../utility/handler');


module.exports = {
    name: Events.GuildCreate,
    once: true,
    execute(guild) {
        client.users.fetch(guild.ownerID)
            .then((user) => user.send(about))
            .catch((err) => handleError(err));
        database.guildRegister(guild.id, guild.name, guild.ownerID);
    },
};
