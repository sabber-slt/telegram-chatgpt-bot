import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
import { ogg } from "./src/ogg.js";
import { openai } from "./src/openai.js";
import fetch from "node-fetch";

dotenv.config();

const bot = new Telegraf(`${process.env.TELEGRAM_API_KEY}`);
bot.use(session());

const INITIAL_SESSION = {
  messages: [],
};

bot.launch();

bot.command("start", async (ctx) => {
  ctx.session === INITIAL_SESSION;
  await ctx.reply("سوال خود را بصورت متنی بپرسید یا از پیام استفاده کنید...");
});

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  const { text } = ctx.message;

  if (text.match("/image")) {
    try {
      await ctx.sendChatAction("upload_photo");
      const image = await openai.imageGeneration(text, String(ctx.from.id));
      await ctx.replyWithPhoto(image.path);
    } catch (e) {
      console.log("Error while image generating", e.message);
    }
  } else {
    try {
      await ctx.sendChatAction("typing");
      ctx.session.messages.push({
        role: openai.roles.USER,
        content: String(text),
      });

      const response = await openai.chat(ctx.session.messages);
      const assistantMessageText = response.content;

      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: assistantMessageText,
      });

      await ctx.reply(response.content);
    } catch (e) {
      console.log("Error while text message", e.message);
    }
  }
});

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  const { voice } = ctx.message;
  await ctx.sendChatAction("record_voice");
  try {
    const voiceLink = await ctx.telegram.getFileLink(voice.file_id);
    const oggPath = await ogg.create(
      voiceLink.href,
      String(ctx.message.from.id)
    );
    const mp3Path = await ogg.toMp3(oggPath, ctx.message.from.id);

    const userMessageText = await openai.transcription(mp3Path);
    ctx.session.messages.push({
      role: openai.roles.USER,
      content: String(userMessageText),
    });

    const response = await openai.chat(ctx.session.messages);
    const assistantMessageText = response.content;

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: String(assistantMessageText),
    });

    await ctx.sendChatAction("record_voice");
    // if you have installed docker, you can use this code for voice message
    // it doesn't support persian language
    const voiceResponse = await fetch(
      `${process.env.VOICE_API}/api/tts?text=${assistantMessageText}&speaker_id=p225&style_wav=&language_id=` // you can change speaker_id to change voice
    );
    const voiceResponseJson = await voiceResponse.arrayBuffer();
    await ctx.sendChatAction("record_voice");
    const voiceResponseBuffer = Buffer.from(voiceResponseJson);
    await ctx.replyWithVoice({ source: Buffer.from(voiceResponseBuffer) });
  } catch (e) {
    console.log("Error while voice message", e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
