#!/usr/bin/env node
'use strict'

require('dotenv').config()
const shell = require('shelljs')

const {
  GCLOUD_PROJECT,
  GCLOUD_BACKEND_BUCKET,
} = process.env


const usage = `Usage: gae-deploy branch

Branch can be: staging, production or any other set up with a "yml" file.`

const verifyDependency = (condition, msg) => {
  if (! condition) {
    console.error(msg)
    process.exit(1)
  }
}

const exec = cmd => {
  console.log(`> ${cmd}`)
  return shell.exec(cmd)
}

const [ branch, ] = process.argv.slice(2)

if (branch) {
  verifyDependency(GCLOUD_PROJECT, 'Sorry, you need to set a GCLOUD_PROJECT environment variable. You can set that in your local ".env" file.')
  verifyDependency(GCLOUD_BACKEND_BUCKET, 'Sorry, you need to set a GCLOUD_BACKEND_BUCKET environment variable. You can set that in your local ".env" file.')
  verifyDependency(shell.which('gcloud'), 'Sorry, you need Google Cloud SDK installed. Get it on https://cloud.google.com/sdk/gcloud/')
  verifyDependency(shell.which('gsutil'), 'Sorry, you need "gsutil" Google Cloud Storage CLI installed. Get it on https://cloud.google.com/storage/docs/gsutil')
  verifyDependency(shell.test('-e', `${branch}.yaml`), `Sorry, I couldn't find "${branch}.yaml"`)

  const storage = `storage/${branch}`
  if(shell.test('-d', storage)) {
    console.log('Syncing static files...')
    exec(`gsutil -m rsync -d -r ${storage} ${GCLOUD_BACKEND_BUCKET}/${branch}`)
  } else console.log(`${storage} not found, skipping static files sync.`)

  console.log(`Deploying ${branch} to GAE...`)
  exec(`gcloud app deploy ${branch}.yaml --project=${GCLOUD_PROJECT} --promote --quiet`)
}
else console.log(usage)
