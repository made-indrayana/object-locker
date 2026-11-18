# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Object Locker is a Discord bot (discord.js v14, Sequelize + SQLite) that lets team members "lock" named objects (e.g. Unity scenes) per channel to avoid git merge conflicts. Locks are scoped by channel; `lockedObject` is case-insensitive (CITEXT) and unique per `channelID`.

## Commands

- `npm install`
- `npm start` runs `node .` (entry: `src/main.js`); `npm run dev` runs it under nodemon.
- `npm run deploy-cmd` registers slash commands to the single guild in `GUILD_ID` (instant, for development). `npm run deploy-cmd:global` registers them for every guild. Use one or the other, or commands appear twice. `npm run delete-cmd` removes both sets. Re-run after changing a command's `data`.
- `npm run lint` (`eslint src`; config in `.eslintrc.json`: 4-space indent, single quotes, semicolons, stroustrup braces, `curly: multi-or-nest` i.e. no braces on single-statement bodies, no inline comments, comma-dangle on multiline)
- No tests exist (`npm test` is a stub).
- Requires a `.env` with `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` (guild deploys and `delete-cmd` only). The SQLite file `database.sqlite` is created in the cwd and gitignored. `config.json` holds non-secret settings (colors, `errorTitle`/`warningTitle`, `autoDeleteDelay`).
- Node 22+ (`.nvmrc`, `engines`).

## Architecture

- `src/main.js` builds the Discord client and auto-loads every `src/commands/<category>/*.js` (must export `data` (SlashCommandBuilder) and `execute(interaction)`) and every `src/events/*.js` (exports `name`, optional `once`, `execute`). Adding a command or event = adding a file; then re-run `deploy-cmd` for commands. `deploy-commands.js` repeats the same directory-scan logic.
- `src/events/interaction-create.js` dispatches slash commands by name with a generic error reply. `client-ready.js` authenticates and syncs the DB; `guild-create/delete` register/deregister guilds.
- `src/database.js` defines three models (`Entry` = a lock, `LockStatusMessages` = last status message per channel, `GuildRegistration`) plus thin async helper functions; commands call these helpers (or the exported models directly).
- `src/utility/handler.js` has `embed()` (themed embeds using `config.json` colors) and error handling by Discord error code; `src/utility/log.js` is the logger.

## Slash-command port

The v12 prefix commands (`!lock`) have been ported to discord.js v14 slash commands, and the client only requests the `Guilds` intent (no privileged intents). The invite needs `scope=bot applications.commands`; the bot needs View Channel, Send Messages and Embed Links. Still open: `validateDatabase` in `database.js` logs before its queries finish, there is no `unhandledRejection` handler, and the README screenshots still show the old `!` commands.

Conventions for commands (`lock.js`, `unlock.js`, `lockstatus.js` are the reference):
- Export `data` (with `.setContexts(InteractionContextType.Guild)` for guild-only commands) and `execute(interaction)`.
- Reply, then call `autoDeleteReply(interaction)` from `utility/handler.js` without awaiting it; replies are removed after `config.autoDeleteDelay`.
- `lock`/`unlock` finish by calling `lockstatus.postChannelStatus(interaction)`, which posts a persistent status message and deletes the channel's previous one (tracked in `LockStatusMessages`). `/lockstatus` does the same through its own reply; `/lockstatus server:true` is ephemeral and not tracked.
- Parse space-separated object names with `parseObjectNames()` (drops empties and case-insensitive duplicates).
- `guildDeregister` removes the guild's locks, status messages and registration.
