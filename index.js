const { Telegraf } = require("telegraf");
const { SessionManager } = require("@puregram/session");
const { message } = require("telegraf/filters");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "Your OpenAI API Key",
});
const openai = new OpenAIApi(configuration);
const bot = new Telegraf("Your Telegram Bot Token");
const MAX_CONTEXT_TOKENS = 4096;
const MAX_RESPONSE_TOKENS = 1000;

const createDialogs = (ctx, next) => {
  if (!ctx?.session?.dialogs) {
    ctx.session.dialogs = new Map();
  }

  return next();
};
const checkAccess = (ctx, next) => {
  if (ctx.session.isAllowed) {
    return next();
  }

  const allowedUsers = "sabber_dev";
  const isAllowed = allowedUsers.includes(ctx.message.from.username);
  ctx.session.isAllowed = isAllowed;
  return isAllowed ? next() : ctx.sendMessage("Access denied!");
};

if (process.env.NODE_ENV === "dev") {
  bot.use(Telegraf.log());
}

bot.use(new SessionManager().middleware);
bot.use(createDialogs);
bot.use(checkAccess);

bot.start(async (ctx) => {
  ctx.session.dialogs.set(ctx.chat.id, []);

  await ctx.sendMessage("سلام خوش آمدید!");
});

bot.help(async (ctx) => {
  await ctx.sendMessage("/reset - Reset dialog context");
});

bot.command("reset", async (ctx) => {
  ctx.session.dialogs.set(ctx.chat.id, []);

  await ctx.sendMessage("Chat has been reset!");
});

bot.on(message("text"), async (ctx) => {
  const chatId = ctx.chat.id;
  const isTest = ctx.message.text.length < 5;

  const typing = setInterval(async () => {
    await ctx.sendChatAction("typing");
  }, 1000);

  if (!ctx.session.dialogs.has(chatId)) {
    ctx.session.dialogs.set(chatId, []);
  }

  let dialog = ctx.session.dialogs.get(chatId);

  if (!isTest) {
    dialog.push({
      role: "user",
      content: ctx.message.text,
    });
  }

  const slicedContext = (dialog) => {
    const contextLength = dialog.reduce(
      (acc, { content }) => acc + content.length,
      0
    );

    if (contextLength <= MAX_CONTEXT_TOKENS - MAX_RESPONSE_TOKENS) {
      return dialog;
    }

    dialog.shift();

    return slicedContext(dialog);
  };

  dialog = slicedContext(dialog);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: dialog,
      max_tokens: MAX_RESPONSE_TOKENS,
    });
    const { message } = response.data.choices[0];
    const { content } = message;

    dialog.push(message);

    clearInterval(typing);
    await ctx.replyWithMarkdown(content);

    ctx.session.dialogs.delete(chatId);
    ctx.session.dialogs.set(chatId, dialog);
  } catch (error) {
    clearInterval(typing);

    const openAIError = error.response?.data?.error?.message;

    if (openAIError) {
      return await ctx.sendMessage(openAIError);
    }

    await ctx.sendMessage(
      error?.response?.statusText ?? error.response.description
    );
  }
});

bot.catch((error) => console.error(error));

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
