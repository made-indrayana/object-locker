# Changelog

## 0.9.9

- Major refactoring on code to make code more readable and understandable
- Handling errors and auto-delete has been improved massively
- Object name is now case-insensitive in database level
- Improved and reduced database queries

## 0.9.8

- Fixed bot crashing when auto delete tries to delete non-existing message.
- Changed `!lockstatus` behaviour so it doesn't auto-delete and persist until the next status message is posted.
- `!lock` and `!unlock` will now automatically do `!lockstatus` as well to reflect changes on the locks status.

## 0.9.7

- Object name is now fully case-insensitive
- Bug fixes that can cause crash on DMs
- Added footer to the bot's embed to notify user about auto deleting messages
- TODO: Bugfix: if you delete the bot's messages before the auto delete kicks in, it will crash the bot

## 0.9.6

- Changed `!unlock` behaviour so it would unlock all objects locked by the user instead of requiring the object name explicitly
- Improved `!lock` and `!unlock` behaviour: it can now lock and unlock multiple object separated by space!
- Fixed and clarified wrong help/error/warning texts
- Excluded debug only command from production code
- TODO: Make object name case-insensitive
- TODO: Confirmation window with reaction answer (Do you guys need this? Pending until further notice)

## 0.9.5

- First closed beta release!
- Feature complete
