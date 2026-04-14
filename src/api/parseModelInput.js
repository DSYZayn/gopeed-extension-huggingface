const DEFAULT_REPO_ENDPOINT = 'hf-mirror.com';

/**
 * Parse a model: private-protocol URL into a standard https:// URL.
 * Formats:
 *   model:user/repo                          → https://hf-mirror.com/user/repo/tree/main
 *   model:user/repo;hf-mirror.com            → https://hf-mirror.com/user/repo/tree/main
 *   model:user/repo/folder/sub               → https://hf-mirror.com/user/repo/tree/main/folder/sub
 *   model:datasets/user/repo                 → https://hf-mirror.com/datasets/user/repo/tree/main
 *   model:datasets/user/repo/folder;custom   → https://custom/datasets/user/repo/tree/main/folder
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

  // Split repoPath so that subfolder segments go after tree/main, not before it.
  // Supported prefixes that consume one extra leading segment: datasets, models, spaces.
  const segments = repoPath.split('/');
  const REPO_TYPE_PREFIXES = new Set(['datasets', 'models', 'spaces']);
  const hasTypePrefix = REPO_TYPE_PREFIXES.has(segments[0]);
  const prefixOffset = hasTypePrefix ? 1 : 0;
  const typePrefix = hasTypePrefix ? segments[0] + '/' : '';
  const user = segments[prefixOffset];
  const repo = segments[prefixOffset + 1];
  const folderParts = segments.slice(prefixOffset + 2);
  const folderSuffix = folderParts.length > 0 ? '/' + folderParts.join('/') : '';

  return new URL(`https://${endpoint}/${typePrefix}${user}/${repo}/tree/main${folderSuffix}`);
}
