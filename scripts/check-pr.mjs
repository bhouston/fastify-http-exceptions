const { PR_BODY = '', BASE_BRANCH, HEAD_BRANCH } = process.env;
if (BASE_BRANCH !== 'main') {
  throw new Error('PRs must target main.');
}
if (!/^(feature|fix|docs|chore|refactor|test)\/\d+-[a-z0-9-]+$/.test(HEAD_BRANCH ?? '')) {
  throw new Error('Use an issue branch such as feature/42-batch-export.');
}
const issue = HEAD_BRANCH.split('/')[1].split('-')[0];
if (!new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${issue}\\b`, 'i').test(PR_BODY)) {
  throw new Error(`PR description must include Closes #${issue}.`);
}
