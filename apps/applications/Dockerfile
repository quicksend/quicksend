FROM node:16-alpine

WORKDIR /home/api

COPY . .

RUN ["chmod", "+x", "/home/api/entrypoint.sh"]

RUN npm ci && npm run build

ENTRYPOINT ["./entrypoint.sh"]
