#!/usr/bin/env node
'use strict'

const { spawnSync } = require('child_process')
const shell = require('shelljs')

const exec = (cmd, args=[]) => {
  console.log(`> ${cmd} ${args.join(' ')}`)
  const { status } = spawnSync(cmd, args, { stdio: [null, process.stdout, process.stderr] })
  if (status !== 0) process.exit(status)
}

const isOnCloud = Boolean(process.env.GCLOUD_PROJECT)
if (isOnCloud) {
  exec('node_modules/.bin/sync')
} else { // Dev ENV
  exec('node_modules/.bin/deploy', ['setup'])
  exec('node_modules/.bin/deploy', ['download'])
}
