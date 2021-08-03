const embed = require('./embed');
const description = `I am a bot to help you avoid merge conflicts in (Game) Dev Teams :innocent:
        
        If you're using \`git\` as your version control and want to work on non-mergeable object, like \`Unity Scenes\` or \`Prefabs\`, you can use me to tell all of the team members what you're working on!

        You can call me in already existing channel (or dedicated) for your project. If you're working on multiple projects, you can call me in multiple channels without polluting the lock status of other projects! *p.s. I also keep the channel tidy!*
        
        Try using
        \`!lock yourSceneName\`
        to announce **I'M WORKING ON THIS :nerd:**

        When you're finished, use
        \`!unlock yourSceneName\`
        to say **I'M DONE WITH THIS :sunglasses:**
        
        Whenever you want to know who is working on what in a project, use
        \`!lockstatus\`

        If you're feeling curious, you can use
        \`!lockstatus server\`
        to see all locked objects in the whole server.
        
        Still have questions? Use \`!help\` or \`!help [command name]\` and I’ll provide further explanation :)`;
const embedObject = embed('Hi! I\'m Object Locker :yum:', `${description}`);
embedObject.setFooter('Made with love by indrayana.net © 2021');

module.exports = embedObject;
