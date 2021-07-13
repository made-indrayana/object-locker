const Discord = require("discord.js");
const client = new Discord.Client();

const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const config = require("../config.json");
const prefix = config.prefix;

const sequelize = new Sequelize(
  {
    dialect: "sqlite",
    storage: "database.sqlite",
  }
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
    sequelize,
    modelName: "Entry",
  }
);

async function ValidateDatabase(database) {
  try {
    await sequelize.authenticate(database);
    await database.sync({force:true});
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database: ", error);
  }
}

async function CreateEntry(serverID, channelID, userID, objectName) {
  try {
    await Entry.create({
      serverID: serverID,
      channelID: channelID,
      userID: userID,
      lockedObject: objectName,
    });
  } catch (error) {
    console.error("Unable to create entry: ", error);
  }
}

client.on("ready", () => {
  console.log('Bot "Object Locker" has been started!');
});

ValidateDatabase(sequelize);

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  else if (message.content.startsWith(prefix)) {
    const rawInput = message.content.slice(1, message.content.length);
    const input = rawInput.split(" ");
    const command = input.shift(); // removes the first item in an array and returns that item
    //const commandArgs = input.join(" ");

    console.log(input.length);

    if (input.length > 1) {
      message.channel.send("Too many arguments, please only use one argument.");

    } else if (command === "lockstatus" && input[0] === undefined) {
      const results = await Entry.findAll({where: {serverID: message.guild.id, channelID: message.channel.id}});
      let strings = new Array();
      results.forEach((entry) =>
        strings.push(`<@${entry.userID}> is locking \`${entry.lockedObject}\``)
      );

      if (strings[0] == null) strings = "No object is currently locked.";
      const embed = new Discord.MessageEmbed()
        .setTitle("Locked Object")
        .setColor("2f4c90")
        .setDescription(strings);
      message.channel.send(embed);

    } else if (command === "lockstatus" && input[0] === "all"){
      const results = await Entry.findAll({where: {serverID: message.guild.id}});
      let strings = new Array();
      results.forEach((entry) =>
        strings.push(`<@${entry.userID}> is locking \`${entry.lockedObject}\` in <#${entry.channelID}>`)
      );

      if (strings[0] == null) strings = "No object is currently locked.";
      const embed = new Discord.MessageEmbed()
        .setTitle("Locked Object")
        .setColor("2f4c90")
        .setDescription(strings);
      message.channel.send(embed);
    
    
     }else if (command === "lock") {
      message.channel.send("Locking Object " + `\`${input[0]}\``);
      CreateEntry(message.guild.id, message.channel.id, message.author.id, input[0]);
    

    } else if (command === "unlock") {
      const result = await Entry.findOne({ where: { serverID: message.guild.id, channelID: message.channel.id, lockedObject: input[0] } });
      if (result != null) {
        const delEntry = await Entry.destroy({
          where: { lockedObject: input[0] },
        });
        message.channel.send("Unlocking Object " + `\`${input[0]}\``);
      } else message.channel.send("Object not locked!");
  }
});

client.login(config.token);
