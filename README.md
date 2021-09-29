# Real Time Events Demo App

Basic implementation demo for EdgeCast Real Time Events

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)



This application requires a backend API to be setup to handle requests.

You can find a pre-constructed demo API [here](https://github.com/tomoguisuru/rte-api)

Both are provided as an example only and are provided without warranty or support

---

## Docker
```bash
git clone <current-repo-ssh-link>
cd client-app
```
create .env file and add:

```
API_HOST=https://rtsapi.uplynk.com
```

run docker with the following commands

```bash
docker build . -t client-app
docker run -d -p 4200:4200 -p 7357:7357 -p 9222:9222 client-app
```

Client: `http://localhost:4200/event/:rts_event_id`
Admin/Publisher: `http://localhost:4200`

## Installation

```bash
# should be using node version 12.22.xx
# should be using npm version 6.14.x
nvm use 12
npm install -g ember-cli
git clone <current-repo-ssh-link>
cd client-app
npm install
```

---

## Running / Development

### .env Setup

The .env addon allows you to have different environment configurations available to you.

```bash
cd client-app
touch .env
touch .env.development
touch .env.staging
```

you will then need to add the following to each file

```
API_HOST=https://rtsapi.uplynk.com
```

### Where do I get my `owner_id` and `integration key`?
* [owner_id](https://cms.uplynk.com/static/cms2/index.html#/settings/)
* [Integration Key](https://cms.uplynk.com/static/cms2/index.html#/settings/integration-keys)

**Example .env Configs**:

_.env.development_
```
API_HOST=https://rtsapi.uplynk.com
```

_.env.staging_
```
API_HOST=https://rtsapi-staging.uplynk.com
```

_.env_
```

API_HOST=http://rtsapi.uplynk.localhost:3000
```

---

## Running the Client App

the `development` environment is the default but you can easily specify additional options using the `-e` flag.

Development
```bash
ember s
```

Staging
```bash
ember s -e staging
```

Production
```bash
ember s -e production
```

---

## Viewing the Streams as a Client Connection

NOTE: Your event must be in a `LIVE` state or no streams will be returned in the manifest

Navigate to http://localhost:4200/event/:rts_event_id

* `:rts_event_id` is the id of the event that you want to view

___


## Publishing a Streams

NOTE: Your event must be in a `LIVE`state or no streams will be returned in the manifest

Navigate to http://localhost:4200/

Login using either an `admin` or `publisher` account

---

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
* [Ember .env](https://github.com/fivetanley/ember-cli-dotenv)
* [Phenix Web Docs](https://phenixrts.com/docs/web/)
