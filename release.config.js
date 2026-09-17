export default {
  branches: ['main'],
  repositoryUrl: 'https://github.com/bhouston/fastify-http-exceptions.git',
  tagFormat: 'v${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'packages/fastify-http-exceptions/publish/CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'packages/fastify-http-exceptions/publish',
        tarballDir: 'release-artifacts',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['release-artifacts/*.tgz', 'packages/fastify-http-exceptions/publish/CHANGELOG.md'],
        successComment: false,
        failComment: false,
        releasedLabels: false,
      },
    ],
  ],
};
