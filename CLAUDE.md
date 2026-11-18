# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Object Locker is a Discord bot (discord.js v14, Sequelize + SQLite) that lets team members "lock" named objects (e.g. Unity scenes) per channel to avoid git merge conflicts. Locks are scoped by channel; `lockedObject` is case-insensitive (CITEXT) and unique per `channelID`.

## Commands

- `npm install`
- `npm start` — runs `nodemon .` (entry: `src/main.js`)
- `npm run deploy-cmd` — registers slash commands to a single guild (`src/deploy-commands.js`; uses `Routes.applicationGuildCommands`). `src/delete-commands.js` removes them.
- Lint: `npx eslint src` (config in `.eslintrc.json`: 4-space indent, single quotes, semicolons, stroustrup braces, `curly: multi-or-nest` i.e. no braces on single-statement bodies, no inline comments, comma-dangle on multiline)
- No tests exist (`npm test` is a stub).
- Requires a `.env` with `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`. The SQLite file `database.sqlite` is created in the cwd and gitignored. `config.json` holds non-secret settings (colors, titles, `autoDeleteDelay`, legacy `prefix`).
- `.nvmrc` says Node 16.9.0 but `package.json` engines says 18.18.2 (discord.js 14 needs Node 16.11+); use Node 18.

## Architecture

- `src/main.js` builds the Discord client and auto-loads every `src/commands/<category>/*.js` (must export `data` (SlashCommandBuilder) and `execute(interaction)`) and every `src/events/*.js` (exports `name`, optional `once`, `execute`). Adding a command or event = adding a file; then re-run `deploy-cmd` for commands. `deploy-commands.js` repeats the same directory-scan logic.
- `src/events/interaction-create.js` dispatches slash commands by name with a generic error reply. `client-ready.js` authenticates and syncs the DB; `guild-create/delete` register/deregister guilds.
- `src/database.js` defines three models (`Entry` = a lock, `LockStatusMessages` = last status message per channel, `GuildRegistration`) plus thin async helper functions; commands call these helpers (or the exported models directly).
- `src/utility/handler.js` has `embed()` (themed embeds using `config.json` colors) and error handling by Discord error code; `src/utility/log.js` is the logger.

## Migration in progress (important)

The codebase is mid-migration from prefix commands (`!lock`, discord.js v12 `message`/`args`) to slash commands (v14 `interaction`). Files are inconsistent:
- `lock.js` is migrated (uses `interaction`, but still carries legacy `aliases`/`usage`/`args` fields and a commented-out `lockstatus.execute` call).
- `lockstatus.js` still uses the old `(message, args)` shape and has no `data`, so `main.js` skips it with a `[WARNING]`; it also imports `handleMessageDelete`, which is commented out/not exported in `handler.js` (as is `sendMessage`'s dependency on it).
- Large commented-out blocks of the old message handler remain (e.g. in `interaction-create.js`) as migration reference.
When touching a command, check whether it has been converted yet and follow the `lock.js` slash-command pattern. User-facing replies are auto-deleted after `config.autoDeleteDelay` via `wait` + `interaction.deleteReply()`.
