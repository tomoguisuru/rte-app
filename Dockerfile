
FROM node:16 as base

EXPOSE 4200 7357 9222

COPY . /app
WORKDIR /app

RUN npm install -q -g ember-cli

RUN npm install


FROM base as production

ENTRYPOINT ember s -e production
