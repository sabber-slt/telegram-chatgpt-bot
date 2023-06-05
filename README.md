## TELEGRAM CHATGPT BOT

A lightweight ChatGPT to Telegram bot that lets you interact with a large language model trained by OpenAI.

# Features

- **New ChatGPT API support.**
- **Voice messages support!**
- **AI-powered image generation**

<p align="center">
    <img src="./demo.gif" width="300"/>
</p>

### How to install ?

- By using your own voice, you can communicate with this bot. Furthermore, the bot offers AI-powered image generation and the availability of ChatGPT text service.
- In order to install, the operating system must have node.js installed.
- In order to use it, you must first acquire an API key from the OpenAI website. [OpenAI API](https://openai.com/)
- Second acquire telegram token from the BOTFATHER. [Telegram token](https://telegram.me/BotFather)

- Clone This repo
- Cd telegram-chatgpt-bot
- To install all modules `npm install`
- To run developer server `node index.js`
- You can install pm2 globally before deploying. `npm i pm2 -g`
- Then run `pm2 start index.js`

## API KEYS

```sh
// put your botfather key here
const bot = new Telegraf("TELEGRAM_TOKEN");
// put your openai api key here
const configuration = new Configuration({
    apiKey: "OPEN_AI_TOKEN",
});

// Using environmental variables is a better practice.
```
