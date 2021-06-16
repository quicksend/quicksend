FROM node:16-alpine

WORKDIR /home/api

COPY . .

RUN npm ci && npm run build

CMD [ "node", "./dist/apps/gateway/main.js" ]
