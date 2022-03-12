import core from '@actions/core'
import github from '@actions/github'

import { getDiff, processFile } from './lib/files.js'
import { getInputs } from './lib/inputs.js'
import { getDefaultBranch } from './lib/repo.js'

const run = async () => {
  const { files, targetRepository, token } = getInputs()
  const [targetOwner, targetRepo] = targetRepository
  const octokit = github.getOctokit(token)
  const defaultBranch = await getDefaultBranch({ octokit, owner: targetOwner, repo: targetRepo })

  if (defaultBranch === null) {
    console.error('Could not read target repository.')

    return
  }

  const diff = await Promise.all(
    Object.entries(files).map(([repoAndPath, localPath]) => getDiff({ localPath, octokit, repoAndPath })),
  )
  const filesToDownload = diff.filter(Boolean)

  await Promise.all(
    filesToDownload.map((file) => processFile({ branch: defaultBranch, file, octokit, targetOwner, targetRepo })),
  )
}

try {
  run()
} catch (error) {
  core.debug(`Error: ${JSON.stringify(error)}`)
  core.setFailed(error.message)
}
