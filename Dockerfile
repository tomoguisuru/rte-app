
FROM node:10.23.3

EXPOSE 4200 7357 9222

COPY . /app
WORKDIR /app

RUN npm install -q -g ember-cli

RUN npm install

ENTRYPOINT ember s -e production