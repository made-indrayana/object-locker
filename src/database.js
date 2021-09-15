require('dotenv').config();
const { Sequelize, Model, DataTypes } = require('sequelize');
const { log, Log } = require('./utility/log');

const instance = new Sequelize (process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: (msg) => log(msg.slice(21), Log.dim),
});

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

async function validateDatabase(database) {

    await instance.authenticate(database)
        .then(log('Database authenticated successfully.'))
        .catch((err) => log(err, 'red'));
    await database.sync()
        .then(log('Database synced successfully.'))
        .catch((err) => log(err, 'red'));

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

    const promise = await GuildRegistration.create({
        serverID: serverID,
        serverName: serverName,
        serverOwnerID: serverOwnerID,
    });

    return promise;
}

async function guildDeregister(serverID) {

    const promise = await GuildRegistration.destroy({
        where: { serverID: serverID },
    });

    return promise;
}
module.exports = {
    instance,
    Entry, LockStatusMessages,
    validateDatabase, createEntry, destroyEntry, destroyAllEntryFromUser,
    registerLastLockStatusMessage, updateLastLockStatusMessage,
    guildRegister, guildDeregister,
};
