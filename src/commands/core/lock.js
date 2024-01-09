const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const { prefix, errorTitle } = require('../../../config.json');
const database = require('../../database');
const lockstatus = require('./lockstatus');
const { embed, handleError } = require('../../utility/handler');
const wait = require('node:timers/promises').setTimeout;
// const { log, Log } = require('../../utility/log');

const commandName = 'lock';

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Use command to lock object on the channel.')
        .addStringOption(option =>
            option.setName('objects')
                .setDescription('Object(s) to be locked, separated by space')
                .setRequired(true)),
    aliases: ['block'],
    usage: [`\`${prefix}${commandName} sceneName\``, `\`${prefix}${commandName} sceneName01 sceneName02\``],
    args: true,
    guildOnly: true,
    async execute(interaction) {
        const promises = [];
        const args = interaction.options.getString('objects');
        const argsarray = args.split(' ');

        const lockmessages = [];
        const errmessages = [];

        for (let i = 0; i < argsarray.length; i++) {
            const promise = await database.createEntry(
                interaction.guild.id,
                interaction.guild.name,
                interaction.channel.id,
                interaction.channel.name,
                interaction.user.id,
                interaction.user.username,
                argsarray[i],
            )
                .then(() => {
                    lockmessages.push(`\`${argsarray[i]}\` is now locked!`);
                })
                .catch((err) => {
                    if (err.name === 'SequelizeUniqueConstraintError') {
                        errmessages.push(`\`${argsarray[i]}\` is already locked!`);
                        handleError(err);
                    }
                });
            promises.push(promise);
        }
        Promise.allSettled(promises).then(() => {
            if(lockmessages.length === 0 && errmessages.length > 0)
                interaction.reply({ embeds: [embed(errorTitle, errmessages.join('\n').toString(), 'error')] });
            else if (lockmessages.length > 0 && errmessages.length === 0)
                interaction.reply({ embeds: [embed('Locked!', lockmessages.join('\n').toString(), 'success')] });
            else {
                interaction.reply({
                    embeds: [
                        embed('Locked!', lockmessages.join('\n').toString(), 'success'),
                        embed(errorTitle, errmessages.join('\n').toString(), 'error'),
                    ],
                });
            }

        });
        await wait(config.autoDeleteDelay);
        await interaction.deleteReply();
        // lockstatus.execute(message, [], true);
    },
};
