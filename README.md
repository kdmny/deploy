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

Make sure to install as a normal dependency, since part of it is run on the deployed instance, and dev-dependencies are not installed on production.

## Prerequisites

1. Create a project https://console.cloud.google.com and note the project ID.
2. Install the `gcloud` sdk https://cloud.google.com/sdk/downloads
3. If this is your first time using the gcloud sdk make sure to run `gcloud auth login`
4. From your project directory, run `gcloud app create --project=your-project-id`

## Setting up

1. Create a bucket to store backend files on [Google Cloud Console](https://console.cloud.google.com/storage). Name suggestion: `backend.project-id.yourdomain.com`.

2. Create an `.env` file in your project's root folder.
Add `GCLOUD_PROJECT` and `GCLOUD_BACKEND_BUCKET` environment variables to it. Don't set `PORT` in your `staging/.env` or `production/.env`, GAE will set this for you.

```
GCLOUD_PROJECT=gae-project-id-1a6std
GCLOUD_BACKEND_BUCKET=gs://gae-project-id.appspot.com
```

This will be used to sync your local `storage` files to the bucket.

3. Create a folder named `storage` on your project's root folder. Inside this folder you should have one folder for each services you want to deploy.
In each folder you should store the files you want to sync in your instances.

```js
// Storing environment files for production and staging:
storage
├── production
│   └── .env
└── staging
    └── .env
```

4. Add `storage` to your `.gitignore` file.

5. Create an GAE yaml config file for each environment you want to have. You do have to include `GCLOUD_BACKEND_BUCKET` here directly, as this will be used to sync your bucket to your instance.

```yaml
# production.yaml
service: default
runtime: nodejs
env: flex

env_variables:
  GCLOUD_BACKEND_BUCKET: 'backend.project-id.yourdomain.com'

skip_files:
 - ^node_modules$
 - ^ignore$
 - ^.env$
```

```yaml
# staging.yaml
service: staging
runtime: nodejs
env: flex

env_variables:
  GCLOUD_BACKEND_BUCKET: 'backend.project-id.yourdomain.com'

skip_files:
 - ^node_modules$
 - ^ignore$
 - ^.env$

manual_scaling:
  instances: 1
```

6. Add sync to your `prestart` hook on `package.json`:
```
// package.json
"scripts": {
  "prestart": "./node_modules/.bin/sync",
  ...
}
```

7. Make sure you already have a `default` service running before you deploy any other. You can deploy to production with `./node_modules/.bin/deploy production`.

8. If you are experience a bug, it might be a problem with the `--quiet` flag, so try running the command
`gcloud app deploy production.yaml --project=your-project-id --promote`

## Commands

### deploy

Usage: `./node_modules/.bin/deploy [staging|production]`

Sync static files to your project's backend bucket and deploys current project using the corresponding `staging.yaml` file.

### sync

Usage: Add `./node_modules/.bin/sync` as the value of `scripts.prestart` on your `package.json`.

Retrieve files from your project's backend bucket and place it on current instance's root folder.
