const { Sequelize, Model, DataTypes } = require('sequelize');

const instance = new Sequelize(
    {
        dialect: 'sqlite',
        storage: 'database.sqlite',
    },
);

class Entry extends Model {}
Entry.init(
    {
        serverID: { type: DataTypes.STRING, allowNull: false },
        channelID: { type: DataTypes.STRING, allowNull: false },
        userID: { type: DataTypes.STRING, allowNull: false },
        lockedObject: { type: DataTypes.STRING, allowNull: false },
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
        await database.sync();
        console.log('Database connection has been established successfully.');
    }
    catch (error) {
        console.error(`Unable to connect to the database: ${error}`);
    }
}

async function createEntry(serverID, channelID, userID, objectName) {
    try {
        await Entry.create({
            serverID: serverID,
            channelID: channelID,
            userID: userID,
            lockedObject: objectName,
        });
    }
    catch (error) {
        console.error(`Unable to create entry: ${error}`);
    }
}

async function destroyEntry(serverID, channelID, objectName) {
    try {
        await Entry.destroy({
            where: {
                serverID: serverID,
                channelID: channelID,
                lockedObject: instance.where(
                    instance.fn('LOWER', instance.col('lockedObject')), 'IS', objectName.toLowerCase()),
            },

        });
    }
    catch (error) {
        console.error(`Unable to destroy entry: ${error}`);
    }
}

async function registerLastLockStatusMessage(serverID, channelID, lockMessageID) {
    try {
        await LockStatusMessages.create({
            serverID: serverID,
            channelID: channelID,
            messageID: lockMessageID,
        });
    }
    catch (error) {
        console.error(`Unable to create entry: ${error}`);
    }
}

async function updateLastLockStatusMessage(serverID, channelID, lockMessageID) {
    try {
        await LockStatusMessages.update({ messageID: lockMessageID }, {
            where: {
                serverID: serverID,
                channelID: channelID,
            },
        });
    }
    catch (error) {
        console.error(`Unable to update entry: ${error}`);
    }
}
module.exports = {
    instance,
    Entry, LockStatusMessages,
    validateDatabase, createEntry, destroyEntry,
    registerLastLockStatusMessage, updateLastLockStatusMessage,
};
