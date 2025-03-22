/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-12 12:35:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 12:50:42
 * @FilePath: \gopeed-extension-huggingface\src\api\prepare.js
 * @Description:
 *
 */

/**
 * Prepares the necessary information for accessing a repository based on the provided URL.
 * This function is designed to parse the URL and extract user, repository, branch, and other information required for accessing the repository.
 * @param {URL} url - The URL object containing the address of the repository.
 * @returns {Object} Returns an object containing baseUrl, user, repo, branch, protocol, port, and pathParts.
 */
export default function prepare(url) {
  // 构造API请求地址（兼容基础域名）
  // 由于modelscope缺乏高效的元信息获取API，统一使用hf-mirror来获取元信息
  // 因此暂时只支持下载modelscope中与hf-mirror同名的数据
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

  return { baseUrl, user, repo, branch, protocol, port, pathParts };
}
