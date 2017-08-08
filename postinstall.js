#!/usr/bin/env node
'use strict'

const { spawnSync } = require('child_process')
const shell = require('shelljs')

const exec = (cmd, args=[]) => {
  console.log(`> ${cmd} ${args.join(' ')}`)
  return spawnSync(cmd, args, { stdio: 'inherit' })
}

const isOnCloud = Boolean(process.env.GCLOUD_PROJECT)
if (isOnCloud) {
  exec('node_modules/.bin/sync')
} else { // Dev ENV
  exec('node_modules/.bin/deploy', ['setup'])
  exec('node_modules/.bin/deploy', ['download'])
}
