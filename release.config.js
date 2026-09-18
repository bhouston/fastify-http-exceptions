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
        changelogFile: 'packages/fastify-http-exceptions/CHANGELOG.md',
      },
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'packages/fastify-http-exceptions',
        tarballDir: 'release-artifacts',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['release-artifacts/*.tgz', 'packages/fastify-http-exceptions/CHANGELOG.md'],
        successComment: false,
        failComment: false,
        releasedLabels: false,
      },
    ],
  ],
};
