#!/usr/bin/env node
'use strict'

const assert = require('assert')
const shell = require('shelljs')
const gcs = require('@google-cloud/storage')()
const { includes, map, filter, flatten } = require('lodash/fp')

// eslint-disable no-console

const branch = process.env.GAE_SERVICE === 'default'
  ? 'production'
  : process.env.GAE_SERVICE

const forCurrentEnvironment = ({ name }) =>
  includes(branch)(name)

const fixName = name => name.replace(/^\w+\//, '')

const download = file => {
  const destination = fixName(file.name)
  console.log(`Downloading file: ${destination}`)
  return file.download({ destination })
}

if (process.env.GCLOUD_PROJECT) {
  const msg = [
    `Syncing static files for ${process.env.GCLOUD_PROJECT}`,
    `service: ${process.env.GAE_SERVICE}`,
    `from ${process.env.GCLOUD_BACKEND_BUCKET}`
  ].join(' ')
  console.log(msg)

  gcs.bucket(`${process.env.GCLOUD_BACKEND_BUCKET}/`)
    .getFiles()
    .then(flatten)
    .then(filter(forCurrentEnvironment))
    .then(map(download))
    .catch(console.log)
}
