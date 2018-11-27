#!/usr/bin/env node

'use strict'

const gcs = require('@google-cloud/storage')()
const { includes, map, filter, flatten } = require('lodash/fp')

/* eslint-disable no-console */

const branch = process.env.GAE_SERVICE === 'default'
  ? 'production'
  : process.env.GAE_SERVICE

const forCurrentEnvironment = ({ name }) =>
  includes(branch)(name)

const download = file => {
  console.log(`Downloading file: ${file.name} to .env`)
  return file.download({ destination: '.env' })
}

const sync = async () => {
  const bucketName = `${process.env.GCLOUD_PROJECT}-backend`
  const bucket = gcs.bucket(bucketName)
  const [exists] = await bucket.exists()

  if (exists) {
    const msg = [
      `Syncing static files for ${process.env.GCLOUD_PROJECT}`,
      `service: ${process.env.GAE_SERVICE}`,
      `from ${bucketName}`,
    ].join(' ')
    console.log(msg)
    bucket
      .getFiles()
      .then(flatten)
      .then(filter(forCurrentEnvironment))
      .then(map(download))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  } else console.log(`${bucketName} doesn't exist, skipping static file sync.`)
}

if (process.env.GCLOUD_PROJECT) {
  sync()
}
