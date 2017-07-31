#!/usr/bin/env node
'use strict'

require('dotenv').config()
const shell = require('shelljs')
const { spawn } = require('child_process')

const { GCLOUD_PROJECT } = process.env
const usage = `Usage: deploy branch
       deploy setup

Branch can be: staging, production or any other set up with a "yml" file.`

const verifyDependency = (condition, msg) => {
  if (! condition) {
    console.error(msg)
    process.exit(1)
  }
}

const exec = (cmd, args) => {
  console.log(`> ${cmd} ${args.join(' ')}`)
  return spawn(cmd, args, { stdio: 'inherit' })
}

const [ branch, ] = process.argv.slice(2)

if (branch) {
  verifyDependency(GCLOUD_PROJECT, 'Sorry, you need to set a GCLOUD_PROJECT environment variable. You can set that in your local ".env" file.')
  verifyDependency(shell.which('gcloud'), 'Sorry, you need Google Cloud SDK installed. Get it on https://cloud.google.com/sdk/gcloud/')
  verifyDependency(shell.which('gsutil'), 'Sorry, you need "gsutil" Google Cloud Storage CLI installed. Get it on https://cloud.google.com/storage/docs/gsutil')

  const bucket = `gs://${GCLOUD_PROJECT}-backend`
  const storage = `storage/${branch}`
  if (branch === 'setup') {
    exec('gsutil', ['mb', '-p', GCLOUD_PROJECT, bucket])
  } else {
    verifyDependency(shell.test('-e', `${branch}.yaml`), `Sorry, I couldn't find "${branch}.yaml"`)
    if(shell.test('-d', storage)) {
      console.log('Syncing static files...')
      exec('gsutil', ['-m', 'rsync', '-d', '-r', storage, `${bucket}/${branch}`])
    } else console.log(`${storage} not found, skipping static files sync.`)

    console.log(`Deploying ${branch} to GAE...`)
    exec('gcloud', ['app', 'deploy', `${branch}.yaml`, `--project=${GCLOUD_PROJECT}`, '-q'])
  }
}
else console.log(usage)
