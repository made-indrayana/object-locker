const { Events } = require('discord.js');
const database = require('../database');
const about = require('../utility/about-text');

const { handleError } = require('../utility/handler');


module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        try {
            await database.guildRegister(guild.id, guild.name, guild.ownerId);
        }
        catch (err) {
            handleError(err);
        }

        try {
            const owner = await guild.client.users.fetch(guild.ownerId);
            await owner.send({ embeds: [about] });
        }
        catch (err) {
            // The owner may have DMs closed, which is not worth more than a log line.
            handleError(err);
        }
    },
};
