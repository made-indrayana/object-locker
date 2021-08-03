const embed = require('../../utilities/embed');

module.exports = {
    name: 'about',
    args: false,
    description: 'About me :nerd:',
    async execute(message) {
        const description = `I am a bot trying to help avoid merge conflicts in (Game) Dev Teams :innocent:
        
        If you're using \`git\` as your version control and want to work on non-mergeable object, like \`Unity Scenes\` or \`Prefabs\`, you can definitely use me to tell all of the team members that you're working on them!

        The channels in your Discord channel is meant to be seen as ***one*** project, so if you're working on multiple projects, this is a win for you!
        
        Try using
        \`!lock yourSceneName\`
        to announce **I'M WORKING ON THIS :nerd:**

        When you're finished, use
        \`!unlock yourSceneName\`
        to say **I'M DONE WITH THIS :sunglasses:**
        
        Whenever you want to know who is working on what on a project, use
        \`!lockstatus\`

        If you're feeling curious, you can use
        \`!lockstatus server\`
        to see all locked objects in the whole server.
        
        Don't understand something? Use \`!help\` or \`!help [command name]\` to let me explain stuff to you!`;
        const embedObject = embed('Hi! I\'m Object Locker :yum:', `${description}`);
        embedObject.setFooter('Made with love by indrayana.net © 2021');
        message.channel.send(embedObject);
    },
};
