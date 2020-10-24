FROM node:15 as node-15-with-nodemon

RUN npm install --global nodemon --silent --no-fund

FROM node-15-with-nodemon

WORKDIR /opt/api

COPY ./public ./public

COPY ./package.json .
COPY ./package-lock.json .
COPY ./src ./src

RUN npm install --silent --no-fund

CMD ["node", "src/api-service.js"]
