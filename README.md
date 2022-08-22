# Real Time Events Demo App

Basic implementation demo for EdgeCast Real Time Events

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://cli.emberjs.com/release/)
* [Google Chrome](https://google.com/chrome/)

This application requires a backend API to be setup to handle requests.

You can find a pre-constructed demo API [here](https://github.com/tomoguisuru/rte-api)

Both are provided as an example only and are provided without warranty or support

---

## Installation

```bash
# should be using node version >= 16.16.xx
# should be using npm version >= 8.11.x
nvm use 16
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
cp .env.development .env
```

you will then need to add the following to each file

```
API_HOST=http://localhost:3000
```

---

## Running the Client App

the `development` environment is the default but you can easily specify additional options using the `-e` flag.

Development
```bash
ember s
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

---

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
* [Ember .env](https://github.com/fivetanley/ember-cli-dotenv)
* [Phenix Web Docs](https://phenixrts.com/docs/web/)
