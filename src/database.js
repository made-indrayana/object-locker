const { Sequelize, Model, DataTypes } = require('sequelize');
const { log } = require('./utility/log');

const instance = new Sequelize (
    {
        dialect: 'sqlite',
        storage: 'database.sqlite',
    },
);

class Entry extends Model {}
Entry.init(
    {
        serverID: { type: DataTypes.STRING, allowNull: false },
        channelID: { type: DataTypes.STRING, allowNull: false, unique: 'project' },
        userID: { type: DataTypes.STRING, allowNull: false },
        lockedObject: { type: DataTypes.STRING + ' COLLATE NOCASE', allowNull: false, unique: 'project' },
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
        messageID: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: instance,
        modelName: 'LockStatusMessages',
    },
);

async function validateDatabase(database) {
    try {
        await instance.authenticate(database);
        await database.sync({});
        log('Database connection has been established successfully.');
    }
    catch (error) {
        console.error(`Unable to connect to the database: ${error}`);
    }
}

async function createEntry(serverID, channelID, userID, objectName) {

    const promise = await Entry.create({
        serverID: serverID,
        channelID: channelID,
        userID: userID,
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

async function registerLastLockStatusMessage(serverID, channelID, lockMessageID) {

    const promise = await LockStatusMessages.create({
        serverID: serverID,
        channelID: channelID,
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
module.exports = {
    instance,
    Entry, LockStatusMessages,
    validateDatabase, createEntry, destroyEntry, destroyAllEntryFromUser,
    registerLastLockStatusMessage, updateLastLockStatusMessage,
};
