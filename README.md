## TELEGRAM CHATGPT BOT

A lightweight ChatGPT to Telegram bot that lets you interact with a large language model trained by OpenAI.

Telegram provides a suitable platform for using chatgpt due to its high security. By running this code, you will be able to utilize the power of chatting, generating images, and conversing with chatgpt for voice.

# Features

- **New ChatGPT API support.**
- **2 way Voice messages support!**
- **AI-powered image generation**
- **Simply Run Docker compose up -d**

<p align="center">
    <img src="./demo.gif" width="300"/>
</p>

### How to install ?

If conversing with chatgpt for voice is not important to you, you can ignore this part. However, to execute the voice, you need to have Docker installed on your operating system in advance, and then run the following code.

```sh
docker run --rm -it -p 5002:5002 --entrypoint /bin/bash ghcr.io/coqui-ai/tts-cpu
python3 TTS/server/server.py --model_name tts_models/en/vctk/vits # To start a server
```

- In order to use it, you must first acquire an API key from the OpenAI website. [OpenAI API](https://openai.com/)
- Second acquire telegram token from the BOTFATHER. [Telegram token](https://telegram.me/BotFather)
- Clone This repo
- Cd telegram-chatgpt-bot
- Put your api keys in .env.local
- Change the name of .env.local to .env
- If you have installed docker in your system just run docker-compose up -d and ignore rest
- To install all modules `yarn`
- To run developer server `yarn dev`
- You can install pm2 globally before deploying. `yarn add pm2 -g`
- Then run `pm2 start index.js`

## API KEYS

```sh
OPENAI_API_KEY= "your openai api key"
TELEGRAM_API_KEY= "your telegram api key"
VOICE_API = "http://localhost:5002"
```
