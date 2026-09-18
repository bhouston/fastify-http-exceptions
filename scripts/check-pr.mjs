const { PR_BODY = '', BASE_BRANCH } = process.env;
if (BASE_BRANCH !== 'main') {
  throw new Error('PRs must target main.');
}
if (!/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+\b/i.test(PR_BODY)) {
  throw new Error('PR description must include a closing reference such as Closes #42.');
}
