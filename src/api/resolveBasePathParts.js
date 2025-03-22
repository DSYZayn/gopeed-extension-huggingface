/**
 * 解析basePathParts
 *
 * @param {string []} pathParts
 * @returns {string [], string} basePathParts, filepath
 */
export default function resolveBasePathParts(pathParts) {
  let filePath = '';
  /**
   * 构建basePathParts
   * @param {string} pathParts
   * @returns {[string, string]} [basePath, filepath]
   */
  const basePathParts = (pathParts) => {
    if (pathParts.length === 0) return [];
    if (pathParts[pathParts.length - 2] === 'tree') {
      return pathParts;
    }
    gopeed.logger.debug('basePathParts:', pathParts);
    filePath = filePath === '' ? pathParts.pop() : pathParts.pop() + '/' + filePath;
    gopeed.logger.debug('function basePathParts--filepath:', filePath);
    return basePathParts(pathParts);
  };

  const basePath = basePathParts(pathParts).join('/').replace('master', 'main');

  return [basePath, filePath];
}
