/**
 * 控制并发请求 || Control concurrent requests
 * @param {Array} items - 要处理的项目数组
 * @param {number} limit - 并发限制数量
 * @param {Function} handler - 处理函数
 * @returns {Promise<Array>}
 */
async function limitConcurrency(items, limit, handler) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    // Create the base promise first
    const basePromise = handler(item);

    // Wrap it with cleanup logic
    const promise = basePromise
      .then((result) => {
        executing.delete(promise);
        return result;
      })
      .catch((error) => {
        executing.delete(promise);
        throw error;
      });

    results.push(promise);
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * 获取模型元数据 || Get Model Metadata
 * @param {string} basePath - 基础路径. e.g. models/KwaiVGI/LivePortrait/tree/main,
 * @param {string} filepath - 文件路径. e.g. insightface/models/buffalo_l
 * @param {number} depth - 当前递归深度
 * @param {number} maxDepth - 最大递归深度（默认10）
 * @returns {Promise<import('@gopeed/types').FileInfo[]>}
 */
async function getMetaDataInternal(basePath, filepath, depth = 0, maxDepth = 10) {
  gopeed.logger.debug('basePath:', basePath, 'filepath:', filepath, 'depth:', depth);

  // 检查深度限制 || Check depth limit
  if (depth >= maxDepth) {
    gopeed.logger.warn(`Reached maximum depth ${maxDepth} for path: ${filepath || 'root'}`);
    return [];
  }

  const path = filepath ? `${basePath}/${filepath}` : basePath;
  // hf-mirror或huggingface.co
  const apiPath = `https://hf-mirror.com/api/${path}`;
  gopeed.logger.debug('apiPath:', apiPath, 'path:', path);

  try {
    const resp = await fetch(apiPath, {
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) throw new Error(`Failed to fetch ${apiPath}`);
    const data = await resp.json();

    // 使用并发控制，限制同时进行的API调用数量（最多5个）|| Use concurrency control to limit simultaneous API calls (max 5)
    const result = await limitConcurrency(data, 5, async (item) => {
      if (item.type === 'directory') {
        return await getMetaDataInternal(basePath, item.path, depth + 1, maxDepth);
      }
      return item;
    });

    // Flatten nested arrays with depth limited by maxDepth
    return result.flat(maxDepth);
  } catch (error) {
    gopeed.logger.error(`Error fetching metadata for ${apiPath}:`, error.message);
    throw error;
  }
}

/**
 * 获取模型元数据 || Get Model Metadata
 * @param {string} basePath - 基础路径. e.g. models/KwaiVGI/LivePortrait/tree/main,
 * @param {string} filepath - 文件路径. e.g. insightface/models/buffalo_l
 * @returns {Promise<import('@gopeed/types').FileInfo[]>}
 */
export default async function getMetaData(basePath, filepath) {
  return getMetaDataInternal(basePath, filepath, 0, 10);
}
