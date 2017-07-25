# gae-deploy

Module to help deploy and run Google App Engine projects with features like:
- Deploy multiple services for production and staging.
- Sync static files from your PC to Google Storage and to App instances.

## Install

```
npm install invisible-tech/gae-deploy

# or

yarn add invisible-tech/gae-deploy
```

Make sure to install as a normal dependency, since part of it is runned on the deployed instance and dev-dependencies are not installed on production.

## Setting up

1. Create an `.env` file in your project's root folder.
Add `GCLOUD_PROJECT` and `GCLOUD_BACKEND_BUCKET` environment variables to it:

```
GCLOUD_PROJECT=gae-project-id-1a6std
GCLOUD_BACKEND_BUCKET=gs://gae-project-id.appspot.com
```

2. Create a folder named `storage` on your project's root folder. Inside this folder you should have one folder for each services you want to deploy.
In each folder you should store the files you want to sync in your instances.

```js
// Storing environment files for production and staging:
storage
├── production
│   └── .env
└── staging
    └── .env
```

3. Add `storage` to your `.gitignore` file.

4. Create an GAE yaml config file for each environment you want to have:
```
// production.yaml 
service: default
runtime: nodejs
env: flex

skip_files:
 - ^node_modules$
 - ^ignore$
 - ^.env$

// staging.yaml 
service: staging
runtime: nodejs
env: flex

skip_files:
 - ^node_modules$
 - ^ignore$
 - ^.env$

manual_scaling:
  instances: 1
```
5. Deploy to staging with `./node_modules/.bin/deploy staging`.

## Commands

### deploy

Usage: `./node_modules/.bin/deploy [staging|production]`

Sync static files to your project's backend bucket and deploys current project using the corresponding `staging.yaml` file.

### sync

Usage: Add `./node_modules/.bin/sync` as the value of `scripts.prestart` on your `package.json`.

Retrieve files from your project's backend bucket and place it on current instance's root folder.
