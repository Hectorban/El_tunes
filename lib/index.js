import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
const commands = [
    {
        name: 'play',
        description: 'Toca canciones pog!',
        type: 1,
        options: [
            {
                type: 3,
                name: "url",
                description: "El url de la cancion",
                required: true
            }
        ]
    }
];
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
})();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'play') {
        console.log(interaction.options.getString('url'));
        await interaction.reply('Playing!');
        const guild = client.guilds.cache.get(interaction.guildId);
        const member = guild.members.cache.get(interaction.user.id);
        if (member.voice.channel) {
            const channel = member.voice.channel;
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('The connection has entered the Ready state - ready to play audio!');
                const player = createAudioPlayer();
                const yt_url = interaction.options.getString('url');
                const stream = ytdl(yt_url, { filter: 'audioonly', dlChunkSize: 0 });
                const resource = createAudioResource(stream);
                player.play(resource);
                connection.subscribe(player);
                player.on(AudioPlayerStatus.Playing, () => {
                    console.log('The audio player has started playing!');
                });
            });
        }
        else {
            await interaction.reply('Necesitas estar en un canal de voz padre');
        }
    }
});
client.login(TOKEN);
//# sourceMappingURL=index.js.map