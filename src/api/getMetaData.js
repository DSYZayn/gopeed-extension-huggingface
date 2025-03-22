/**
 * 获取模型元数据 || Get Model Metadata
 * @param {string} basePath - 基础路径. e.g. models/KwaiVGI/LivePortrait/tree/main,
 * @param {string} filepath - 文件路径. e.g. insightface/models/buffalo_l
 * @returns {Promise<import('@gopeed/types').FileInfo[]>}
 */
export default async function getMetaData(basePath, filepath) {
  gopeed.logger.debug('basePath:', basePath, 'filepath:', filepath);
  const path = filepath ? `${basePath}/${filepath}` : basePath;
  // hf-mirror或huggingface.co
  const apiPath = `https://hf-mirror.com/api/${path}`;
  gopeed.logger.debug('apiPath:', apiPath, 'path:', path);
  const resp = await fetch(apiPath, {
    headers: { Accept: 'application/json' },
  });
  if (!resp.ok) throw new Error(`Failed to fetch ${apiPath}`);
  const data = await resp.json();
  const result = await Promise.all(
    data.map(async (item) => {
      if (item.type === 'directory') return await getMetaData(basePath, item.path);
      return item;
    })
  );
  return result.flat(Infinity);
}
