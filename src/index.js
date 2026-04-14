/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-02-04 02:34:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 13:43:56
 * @FilePath: \gopeed-extension-huggingface\src\index.js
 * @Description: 入口文件
 */
import prepare from './api/prepare.js';
import resolveBasePathParts from './api/resolveBasePathParts.js';
import getMetaData from './api/getMetaData.js';
import walkFiles from './api/walkFiles.js';
import parseModelInput from './api/parseModelInput.js';

const KNOWN_ENDPOINTS = new Set(['huggingface.co', 'hf-mirror.com', 'alpha.hf-mirror.com', 'www.modelscope.cn']);

function buildEndpointSet() {
  const custom = gopeed.settings.customEndpoints
    ? gopeed.settings.customEndpoints
        .split(';')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];
  if (custom.length === 0) return KNOWN_ENDPOINTS;
  return new Set([...KNOWN_ENDPOINTS, ...custom]);
}

gopeed.events.onResolve(async function (ctx) {
  gopeed.logger.debug('[HF Parser] ctx.req.url:', ctx.req.url);
  try {
    let url;
    const endpointSet = buildEndpointSet();

    if (ctx.req.url.startsWith('model:')) {
      if (!gopeed.settings.repoMode) {
        gopeed.logger.debug('[HF Parser] model: mode disabled, skipping');
        return;
      }
      url = parseModelInput(ctx.req.url);
      if (!endpointSet.has(url.hostname)) {
        gopeed.logger.error('[HF Parser] model: endpoint not in allowed list:', url.hostname);
        return;
      }
      gopeed.logger.debug('[HF Parser] model: mode, converted URL:', url.href);
    } else {
      url = new URL(ctx.req.url); // e.g. https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M
      if (!endpointSet.has(url.hostname)) {
        gopeed.logger.debug('[HF Parser] Skipping unrecognized host:', url.hostname);
        return;
      }
    }

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
