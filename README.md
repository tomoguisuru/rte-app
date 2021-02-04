# Phenix Client Demo App

Basic demo of a client app using the manifest data provided
from the `v4 services` API

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

---

## Installation

```bash
npm install -g ember-cli
git clone git@git.vzbuilders.com:bdrake/client-app.git
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
CMS_HOST=<api_domain>
CMS_OWNER_ID=cms_owner_id
CMS_API_KEY=cms_integration_key
```

### Where do I get my `owner_id` and `integration key`?
* [owner_id](https://cms.uplynk.com/static/cms2/index.html#/settings/)
* [Integration Key](https://cms.uplynk.com/static/cms2/index.html#/settings/integration-keys)

**Example .env Configs**:

_.env.development_
```
CMS_HOST=http://services.downlynk.localhost:8000
CMS_OWNER_ID=<downlynk_owner_id>
CMS_API_KEY=<downlynk_integration_key>
```

_.env.staging_
```
CMS_HOST=http://services.uplynk.localhost:8000
CMS_OWNER_ID=<uplynk_owner_id>
CMS_API_KEY=<uplynk_integration_key>
```

_.env_
```
CMS_HOST=http://services.uplynk.com
CMS_OWNER_ID=<uplynk_owner_id>
CMS_API_KEY=<uplynk_integration_key>
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

---

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
* [Ember .env](https://github.com/fivetanley/ember-cli-dotenv)
* [Phenix Web Docs](https://phenixrts.com/docs/web/)