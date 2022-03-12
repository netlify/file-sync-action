import process from 'process'

import core from '@actions/core'

export const getInputs = () => {
  const { FILES: envFiles, GITHUB_REPOSITORY: envRepository, GITHUB_TOKEN: envToken } = process.env
  const targetRepository = envRepository.split('/')
  const token = envToken || core.getInput('token')
  const rawFiles = envFiles || core.getInput('files')

  let files = {}

  try {
    files = JSON.parse(rawFiles)
  } catch {
    console.error(`Could not parse file mapping: ${rawFiles}`)
  }

  return {
    files,
    targetRepository,
    token,
  }
}
