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

async function validateDatabase(database) {
	try {
		await instance.authenticate(database);
		await database.sync({ force:true });
		console.log('Connection has been established successfully.');
	}
	catch (error) {
		console.error('Unable to connect to the database: ', error);
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
		console.error('Unable to create entry: ', error);
	}
}

module.exports = { instance, Entry, validateDatabase, createEntry };
