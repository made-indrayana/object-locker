const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("../config.json");

const prefix = config.prefix;

async function clearAllMessagesByCloning(channel) {

    channel.send("Trying to delete...");
    // Clone channel
    await channel.clone()

    // Delete old channel
    channel.delete()
}

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  else if (message.content.startsWith(prefix + "lockstatus")) {
    message.channel.send("I will display locked scene");
    
  }
  
  else if (message.content.startsWith(prefix + "lock")){
    message.channel.send("Locking scene " + `\`${message.content}\``)
  }

  else if (message.content.startsWith(prefix + "unlock")){
    message.channel.send("Unlocking scene " + `\`${message.content}\``)
  }

  else if (message.content.startsWith(prefix + "cls")) {
    clearAllMessagesByCloning(message.channel);
  }
});

client.login(config.token);
