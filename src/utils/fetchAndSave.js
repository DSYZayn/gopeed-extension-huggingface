/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-12 13:30:00
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 13:40:28
 * @FilePath: \gopeed-extension-huggingface\src\fetchAndSave.js
 * @Description: 模拟调用 src/index.js 中的逻辑并保存结果, 本地使用 node 运行此脚本，并将所有涉及gopeed的内容注释掉
 */

import prepare from '../api/prepare.js';
import resolveBasePathParts from '../api/resolveBasePathParts.js';
import getMetaData from '../api/getMetaData.js';
import walkFiles from '../api/walkFiles.js';
import fs from 'fs';

async function fetchAndSave(url, outputPath) {
  try {
    let urlObj = new URL(url);

    const { baseUrl, user, repo, branch, protocol, port, pathParts } = prepare(urlObj);

    const [basePath, filePath] = resolveBasePathParts(pathParts);

    const data = await getMetaData(basePath, filePath);
    const result = {
      name: user,
      files: walkFiles(data, branch, basePath, protocol, baseUrl, port, repo),
    };

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Result saved to ${outputPath}`);
  } catch (err) {
    console.error('[HF Parser]', err);
  }
}

// 示例调用
const links = [
  'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main',
  'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo',
  'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo/models',
];

links.forEach((link, index) => {
  const outputPath = `assets/result_${index + 1}.json`;
  fetchAndSave(link, outputPath);
});
