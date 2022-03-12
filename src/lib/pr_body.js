export const getPRBody = ({ localPath, remotePath, sourceRepo }) => `
:loudspeaker: There was an update to \`${remotePath}\` in https://github.com/${sourceRepo}. Your repository is configured to sync this file with \`${localPath}\`.

:rocket: To get the update, merge this pull request.

:no_good: To discard the update, close this pull request.
`
