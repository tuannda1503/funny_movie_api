FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN docker-compose up -d

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
