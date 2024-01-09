const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { prefix, errorTitle } = require('../../../config.json');
const database = require('../../database');
const lockstatus = require('./lockstatus');
const { embed, handleError } = require('../../utility/handler');
const wait = require('node:timers/promises').setTimeout;
const { log, Log } = require('../../utility/log');

const commandName = 'unlock';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Use command to lock object on the channel.')
        .addStringOption(option =>
            option.setName('objects')
                .setDescription('Object(s) to be unlocked, separated by space. If empty, all object will be unlocked.')
                .setRequired(false)),
    aliases: ['unblock', 'release'],
    usage: [`\`${prefix}${commandName}\` > will unlock *all* of your locked objects!`,
        `\`${prefix}${commandName} sceneName\``,
        `\`${prefix}${commandName} sceneName01 sceneName02\``],
    args: false,
    guildOnly: true,
    async execute(interaction) {

        const promises = [];

        const args = interaction.options.getString('objects');
        let argsarray;
        let embedObject;
        let hasArgument = false;

        const unlockmessages = [];
        const errmessages = [];

        if(args === null || args === '')
            argsarray = [];
        else argsarray = args.split(' ');

        // IF THERE'S NO ARGUMENT, DO THE FOLLOWING:

        if (argsarray.length === 0) {
            const prms = database.destroyAllEntryFromUser(interaction.guild.id, interaction.channel.id, interaction.user.id)
                .then((promise) => {
                    switch(promise) {
                    case 0:
                        embedObject = embed(errorTitle, 'You currently have no object locked!', 'error');
                        break;
                    default: {
                        let objectString = 'object';
                        if(promise > 1)
                            objectString += 's';
                        embedObject = embed('Unlocked!', `You have successfully unlocked \`${promise}\` ${objectString}!`, 'success');
                        break;
                    }
                    }
                })
                .catch((err) => handleError(err));
            promises.push(prms);
        }

        // IF THERE'S AN ARGUMENT, DO THE FOLLOWING:

        else {
            hasArgument = true;
            for (let i = 0; i < argsarray.length; i++) {
                const prms = database.destroyEntry(interaction.guild.id, interaction.channel.id, args[i])
                    .then((promise) => {
                        switch(promise) {
                        case 0:
                            errmessages.push(`\`${argsarray[i]}\` is not locked!`);
                            break;
                        default:
                            unlockmessages.push(`\`${argsarray[i]}\` is unlocked!`);
                            break;
                        }
                    })
                    .catch((err) => handleError(err));
                promises.push(prms);
            }

        }

        Promise.allSettled(promises).then(() => {
            if(!hasArgument)
                interaction.reply({ embeds: [embedObject] });
            else if(unlockmessages.length === 0 && errmessages.length > 0)
                interaction.reply({ embeds: [embed(errorTitle, errmessages.join('\n').toString(), 'error')] });
            else if (unlockmessages.length > 0 && errmessages.length === 0)
                interaction.reply({ embeds: [embed('Unlocked!', unlockmessages.join('\n').toString(), 'success')] });
            else {
                interaction.reply({
                    embeds: [
                        embed('Unlocked!', unlockmessages.join('\n').toString(), 'success'),
                        embed(errorTitle, errmessages.join('\n').toString(), 'error'),
                    ],
                });
            }
            // lockstatus.execute(message, [], true);
        });

        await wait(config.autoDeleteDelay);
        await interaction.deleteReply();

    },
};
