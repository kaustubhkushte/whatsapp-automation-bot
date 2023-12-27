FROM node:16.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon

COPY . .

CMD ["npm", "start"]
