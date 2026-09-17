import assert from 'node:assert/strict';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';
import config from '../release.config.js';

const context = {
  cwd: process.cwd(),
  options: { repositoryUrl: config.repositoryUrl },
  branch: { name: 'main' },
  lastRelease: { version: '1.3.0', gitTag: 'v1.3.0' },
  nextRelease: { version: '1.3.1', gitTag: 'v1.3.1' },
  logger: { log() {} },
};
for (const [message, expected] of [
  ['fix: correct an error', 'patch'],
  ['feat: add a feature', 'minor'],
  ['feat!: change the API', 'major'],
  ['fix: change the API\n\nBREAKING CHANGE: the API changed', 'major'],
  ['chore: update tooling', null],
]) {
  const commits = [{ hash: 'a'.repeat(40), message }];
  assert.equal(await analyzeCommits(config.plugins[0][1], { ...context, commits }), expected);
  if (expected) {
    const notes = await generateNotes(config.plugins[1][1], { ...context, commits });
    assert.ok(notes.includes(message.split(': ')[1].split('\n')[0]), 'Release notes must describe the change');
    if (expected === 'major') assert.match(notes, /BREAKING CHANGES/);
  }
}
console.log('Release analysis and note generation passed for patches, features, breaking changes, and chores.');
