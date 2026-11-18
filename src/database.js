require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, Model, DataTypes } = require('sequelize');
const { log } = require('./utility/log');

// DATABASE_PATH lets the SQLite file live on a persistent volume; it defaults to ./database.sqlite.
const storage = path.resolve(process.env.DATABASE_PATH || 'database.sqlite');
fs.mkdirSync(path.dirname(storage), { recursive: true });

const instance = new Sequelize (
    {
        dialect: 'sqlite',
        storage,
    },
);

class Entry extends Model {}
Entry.init(
    {
        serverID: { type: DataTypes.STRING, allowNull: false },
        channelID: { type: DataTypes.STRING, allowNull: false, unique: 'project' },
        serverName: { type: DataTypes.STRING, allowNull: false },
        channelName: { type: DataTypes.STRING, allowNull: false },
        userID: { type: DataTypes.STRING, allowNull: false },
        userName: { type: DataTypes.STRING, allowNull: false },
        lockedObject: { type: DataTypes.CITEXT, allowNull: false, unique: 'project' },
    },
    {
        sequelize: instance,
        modelName: 'Entry',
    },
);

class LockStatusMessages extends Model {}
LockStatusMessages.init(
    {
        serverID: { type: DataTypes.STRING, allowNull: false },
        channelID: { type: DataTypes.STRING, allowNull: false },
        serverName: { type: DataTypes.STRING, allowNull: false },
        channelName: { type: DataTypes.STRING, allowNull: false },
        messageID: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: instance,
        modelName: 'LockStatusMessages',
    },
);

class GuildRegistration extends Model {}
GuildRegistration.init(
    {
        serverID: { type: DataTypes.STRING, allowNull: false },
        serverName: { type: DataTypes.STRING, allowNull: false },
        serverOwnerID: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: instance,
        modelName: 'ServerInstallation',
    },
);

/**
 * Connects to the database and creates missing tables. Rejects if either step fails.
 */
async function validateDatabase() {

    await instance.authenticate();
    log('Database authenticated successfully.');
    await instance.sync();
    log('Database synced successfully.');

}

async function createEntry(serverID, serverName, channelID, channelName, userID, userName, objectName) {

    const promise = await Entry.create({
        serverID: serverID,
        serverName: serverName,
        channelID: channelID,
        channelName: channelName,
        userID: userID,
        userName: userName,
        lockedObject: objectName,
    });

    return promise;

}

async function destroyEntry(serverID, channelID, objectName) {

    const promise = await Entry.destroy({
        where: {
            serverID: serverID,
            channelID: channelID,
            lockedObject: objectName,
        },
    });

    return promise;


}

async function destroyAllEntryFromUser(serverID, channelID, userID) {

    const promise = await Entry.destroy({
        where: {
            serverID: serverID,
            channelID: channelID,
            userID: userID,
        },
    });

    return promise;

}

async function registerLastLockStatusMessage(serverID, serverName, channelID, channelName, lockMessageID) {

    const promise = await LockStatusMessages.create({
        serverID: serverID,
        serverName: serverName,
        channelID: channelID,
        channelName: channelName,
        messageID: lockMessageID,
    });

    return promise;
}

async function updateLastLockStatusMessage(serverID, channelID, lockMessageID) {

    const promise = await LockStatusMessages.update({ messageID: lockMessageID }, {
        where: {
            serverID: serverID,
            channelID: channelID,
        },
    });

    return promise;

}

async function guildRegister(serverID, serverName, serverOwnerID) {

    const [registration] = await GuildRegistration.findOrCreate({
        where: { serverID: serverID },
        defaults: { serverName: serverName, serverOwnerID: serverOwnerID },
    });

    return registration;
}

/**
 * Removes the guild registration along with every lock and status message belonging to that guild.
 */
async function guildDeregister(serverID) {

    const where = { where: { serverID: serverID } };
    const results = await Promise.all([
        Entry.destroy(where),
        LockStatusMessages.destroy(where),
        GuildRegistration.destroy(where),
    ]);

    return results;
}

module.exports = {
    instance,
    Entry, LockStatusMessages,
    validateDatabase, createEntry, destroyEntry, destroyAllEntryFromUser,
    registerLastLockStatusMessage, updateLastLockStatusMessage,
    guildRegister, guildDeregister,
};
