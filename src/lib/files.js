import { getPRBody } from './pr_body.js'
import { getFile } from './repo.js'
import { getSHAOfLocalFile } from './sha.js'

const getDiff = async ({ localPath, octokit, repoAndPath }) => {
  const [sourceRepo, remotePath] = repoAndPath.split('#')
  const [repoOwner, repoName] = sourceRepo.split('/')
  const remoteFile = await getFile({ octokit, owner: repoOwner, repo: repoName, path: remotePath })

  if (remoteFile === null) {
    console.error(`Could not retrieve file ${remotePath} from ${sourceRepo}.`)

    return
  }

  const remoteSha = remoteFile.sha
  const localSha = await getSHAOfLocalFile(localPath)

  if (localSha === null) {
    console.error(`Could not read local file: ${localPath}`)

    return
  }

  if (localSha === remoteSha) {
    console.log(`Unmodified file: ${localPath}.`)

    return
  }

  return { localPath, localSha, remoteContent: remoteFile.content, remotePath, remoteSha, sourceRepo }
}

const processFile = async ({ branch, file, octokit, targetOwner, targetRepo }) => {
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner: targetOwner,
    repo: targetRepo,
    per_page: 1,
  })
  const latestSha = commits[0].sha
  const branchName = `refs/heads/file-sync-${file.remoteSha}`

  try {
    await octokit.rest.git.createRef({
      owner: targetOwner,
      repo: targetRepo,
      ref: branchName,
      sha: latestSha,
    })
  } catch (error) {
    if (error.status === 422) {
      console.log(`Branch ${branchName} already exists. Skipping...`)

      return
    }

    throw error
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: targetOwner,
    repo: targetRepo,
    path: file.localPath,
    message: `Update ${file.localPath}`,
    branch: branchName,
    content: file.remoteContent,
    sha: file.remoteSha,
  })

  const body = getPRBody({ localPath: file.localPath, remotePath: file.remotePath, sourceRepo: file.sourceRepo })

  await octokit.rest.pulls.create({
    owner: targetOwner,
    repo: targetRepo,
    title: `Update ${file.localPath}`,
    head: branchName,
    base: branch,
    body,
  })
}

export { getDiff, processFile }
