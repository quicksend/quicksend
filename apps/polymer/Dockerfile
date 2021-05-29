# syntax=docker/dockerfile:1

FROM node:16.0.0-alpine3.11

WORKDIR /api

COPY ./dist/apps/api .
COPY ./config.yml .

ENV NODE_ENV=production

EXPOSE 3000

RUN npm install --production
RUN npm install reflect-metadata tslib

CMD node ./main.js

