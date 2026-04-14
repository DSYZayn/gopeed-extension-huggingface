const DEFAULT_REPO_ENDPOINT = 'hf-mirror.com';

/**
 * Parse a model: private-protocol URL into a standard https:// URL.
 * Formats:
 *   model:user/repo                   → https://hf-mirror.com/user/repo/tree/main
 *   model:user/repo;hf-mirror.com     → https://hf-mirror.com/user/repo/tree/main
 *   model:datasets/user/repo          → https://hf-mirror.com/datasets/user/repo/tree/main
 *   model:datasets/user/repo;custom   → https://custom/datasets/user/repo/tree/main
 * @param {string} rawUrl
 * @returns {URL}
 */
export default function parseModelInput(rawUrl) {
  if (!rawUrl.startsWith('model:')) {
    throw new Error(`[HF Parser] parseModelInput called with invalid input: ${rawUrl}`);
  }
  const content = rawUrl.slice('model:'.length).trim();
  const semicolonIdx = content.indexOf(';');
  let repoPath, endpoint;
  if (semicolonIdx !== -1) {
    repoPath = content.slice(0, semicolonIdx).trim();
    endpoint = content.slice(semicolonIdx + 1).trim() || DEFAULT_REPO_ENDPOINT;
  } else {
    repoPath = content;
    endpoint = DEFAULT_REPO_ENDPOINT;
  }
  return new URL(`https://${endpoint}/${repoPath}/tree/main`);
}
