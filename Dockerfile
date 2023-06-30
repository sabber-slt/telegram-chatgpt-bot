FROM node:18-alpine
WORKDIR /telegram-chatgpt-bot
COPY package.json .env ./
RUN npm install
COPY . .
EXPOSE 3000
CMD node index.js
