const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const config = require("./config.json");

function startBot(bot) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.once("ready", async () => {
    console.log(`✅ ${bot.name} شغال`);

    // دخول الروم تلقائي
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.get(bot.voiceChannelId);
    if (!channel) return;

    joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    // تغيير الاسم حسب الروم
    guild.members.me.setNickname(channel.name);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // لازم يكون المستخدم بنفس الروم
    if (
      !message.member.voice.channel ||
      message.member.voice.channel.id !== bot.voiceChannelId
    ) return;

    const content = message.content.trim().toLowerCase();

    const play = ["ش", "شغل", "تشغيل", "play", "p"];
    const stop = ["وقف", "ايقاف", "ستوب", "طفي"];

    if (play.some(cmd => content.startsWith(cmd))) {
      message.reply(`🎵 ${bot.name} يشغل الآن`);
    }

    if (stop.includes(content)) {
      message.reply("⏹️ تم الإيقاف");
    }

    // تغيير الروم (setup)
    if (
      message.mentions.has(client.user) &&
      content.includes("setup")
    ) {
      const newChannel = message.member.voice.channel;
      bot.voiceChannelId = newChannel.id;

      joinVoiceChannel({
        channelId: newChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      message.guild.members.me.setNickname(newChannel.name);
      message.reply("✅ تم ربط البوت بهذا الروم");
    }
  });

  client.login(bot.token);
}

config.bots.forEach(startBot);
