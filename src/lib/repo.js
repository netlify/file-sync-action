const getDefaultBranch = async ({ octokit, owner, repo }) => {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    })

    return data.default_branch
  } catch {
    return null
  }
}

const getFile = async ({ octokit, owner, repo, path }) => {
  try {
    const file = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    })

    return file.data
  } catch {
    return null
  }
}

export { getDefaultBranch, getFile }
