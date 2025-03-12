/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-02-04 02:34:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 12:39:25
 * @FilePath: \gopeed-extension-huggingface\src\index.js
 * @Description: 入口文件
 */
import prepare from './api/prepare.js';
import resolveBasePathParts from './api/resolveBasePathParts.js';
import getMetaData from './api/getMetaData.js';
import walkFiles from './api/walkFiles.js';

gopeed.events.onResolve(async function (ctx) {
  try {
    let url = new URL(ctx.req.url); // e.g. https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M

    const { baseUrl, user, repo, branch, protocol, port, pathParts } = prepare(url);

    const [basePath, filePath] = resolveBasePathParts(pathParts);

    const data = await getMetaData(basePath, filePath);
    ctx.res = {
      name: user,
      files: walkFiles(data, branch, basePath, protocol, baseUrl, port, repo),
    };
    gopeed.logger.debug('ctx.res:', JSON.stringify(ctx.res));
  } catch (err) {
    gopeed.logger.error('[HF Parser]', err);
    ctx.res = {
      name: 'Error',
      files: [],
    };
  }
});
