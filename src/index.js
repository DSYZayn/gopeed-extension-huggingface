/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-02-04 02:34:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-11 12:52:24
 * @FilePath: \gopeed-extension-huggingface\src\index.js
 * @Description: 入口文件
 */
import getMetaData from './api/getMetaData.js';
import walkFiles from './api/walkFiles.js';
import resolveBasePathParts from './api/resolveBasePathParts.js';

gopeed.events.onResolve(async function (ctx) {
  try {
    let url = new URL(ctx.req.url); // e.g. https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M
    const baseUrl = url.host; // e.g. hf-mirror.com
    const branch = baseUrl === 'www.modelscope.cn' ? 'master' : 'main';
    const protocol = url.protocol; // Generally https: or http:
    const port = url.port || (protocol === 'https:' ? 443 : 80); // Explicit port for https: or http:, default 80 for http:, 443 for https:
    let pathParts = url.pathname.substring(1).split('/'); //e.g. [unsloth, DeepSeek-R1-GGUF, tree, main, DeepSeek-R1-UD-IQ1_M]
    if (pathParts.includes('resolve') || pathParts.includes('spaces')) {
      return; // 不解析单文件 || Don't resolve single file.
    }
    if (pathParts[pathParts.length - 1] === '') {
      pathParts.pop();
    }
    if (pathParts[0] != 'models' && pathParts[0] != 'datasets' && pathParts[0] != 'spaces') {
      pathParts = ['models', ...pathParts]; // 补齐路径：models/ || Complete path: models/
    }

    const [user, repo] = pathParts.slice(1, 3);
    if (pathParts.length === 3) {
      // 补齐路径: /models/tree/main
      pathParts = [...pathParts, 'tree', 'main'];
    }
    gopeed.logger.debug('user:', user, 'repo:', repo);
    // 构造API请求地址（兼容基础域名）
    // 由于modelscope缺乏高效的元信息获取API，统一使用hf-mirror来获取元信息
    // 因此暂时只支持下载modelscope中与hf-mirror同名的数据

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
