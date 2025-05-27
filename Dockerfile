FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN chmod -R +x ./node_modules/.bin

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
