/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-12 13:44:00
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 14:23:46
 * @FilePath: \gopeed-extension-huggingface\src\index.test.js
 * @Description: 单元测试文件
 */
import { readFile } from 'fs/promises';
import { describe, it, expect, jest } from '@jest/globals';
import prepare from './api/prepare.js';
import resolveBasePathParts from './api/resolveBasePathParts.js';
import getMetaData from './api/getMetaData.js';
import walkFiles from './api/walkFiles.js';

/* eslint-disable no-undef */
global.gopeed = {
  events: {
    onResolve: jest.fn(),
  },
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  settings: jest.fn(),
};

describe('gopeed.events.onResolve', () => {
  const links = [
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main',
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo',
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo/models',
  ];

  links.forEach((link, index) => {
    it(`should return the correct response for link ${link}`, async () => {
      const url = new URL(link);
      const { baseUrl, user, repo, branch, protocol, port, pathParts } = prepare(url);

      const [basePath, filePath] = resolveBasePathParts(pathParts);

      const data = await getMetaData(basePath, filePath);
      const result = {
        name: user,
        files: walkFiles(data, branch, basePath, protocol, baseUrl, port, repo),
      };
      const expectedFilePath = `../assets/result_${index + 1}.json`;
      const expectedResult = JSON.parse(await readFile(new URL(expectedFilePath, import.meta.url)));

      expect(result).toEqual(expectedResult);
    }, 30000);
  });
});
