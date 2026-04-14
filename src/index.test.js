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
import parseModelInput from './api/parseModelInput.js';

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
    'https://hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main',
    'https://hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo',
    'https://hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo/models',
    'https://alpha.hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main',
    'https://alpha.hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo',
    'https://alpha.hf-mirror.com/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo/models',
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

describe('parseModelInput', () => {
  it('converts model:user/repo to https URL with default endpoint', () => {
    expect(parseModelInput('model:user/repo').href).toBe('https://hf-mirror.com/user/repo/tree/main');
  });

  it('converts model:user/repo;endpoint to https URL with specified endpoint', () => {
    expect(parseModelInput('model:user/repo;alpha.hf-mirror.com').href).toBe(
      'https://alpha.hf-mirror.com/user/repo/tree/main',
    );
  });

  it('converts model:datasets/user/repo to https URL with datasets prefix', () => {
    expect(parseModelInput('model:datasets/user/repo').href).toBe(
      'https://hf-mirror.com/datasets/user/repo/tree/main',
    );
  });

  it('falls back to default endpoint when semicolon is present but endpoint is empty', () => {
    expect(parseModelInput('model:user/repo;').href).toBe('https://hf-mirror.com/user/repo/tree/main');
  });

  it('throws on input that does not start with model:', () => {
    expect(() => parseModelInput('https://hf-mirror.com/user/repo')).toThrow('[HF Parser] parseModelInput called with invalid input');
  });
});

describe('model: shorthand integration', () => {
  // Each model: input is equivalent to an existing full-URL test case (same result file)
  const modelLinks = [
    { input: 'model:zaynchen/gopeed-extension-huggingface', resultFile: 'result_4.json' },
    { input: 'model:zaynchen/gopeed-extension-huggingface/mock-repo', resultFile: 'result_5.json' },
    { input: 'model:zaynchen/gopeed-extension-huggingface/mock-repo/models', resultFile: 'result_6.json' },
    { input: 'model:zaynchen/gopeed-extension-huggingface;alpha.hf-mirror.com', resultFile: 'result_7.json' },
    { input: 'model:zaynchen/gopeed-extension-huggingface/mock-repo;alpha.hf-mirror.com', resultFile: 'result_8.json' },
    {
      input: 'model:zaynchen/gopeed-extension-huggingface/mock-repo/models;alpha.hf-mirror.com',
      resultFile: 'result_9.json',
    },
  ];

  modelLinks.forEach(({ input, resultFile }) => {
    it(`should return the correct response for ${input}`, async () => {
      const url = parseModelInput(input);
      const { baseUrl, user, repo, branch, protocol, port, pathParts } = prepare(url);

      const [basePath, filePath] = resolveBasePathParts(pathParts);

      const data = await getMetaData(basePath, filePath);
      const result = {
        name: user,
        files: walkFiles(data, branch, basePath, protocol, baseUrl, port, repo),
      };
      const expectedResult = JSON.parse(await readFile(new URL(`../assets/${resultFile}`, import.meta.url)));

      expect(result).toEqual(expectedResult);
    }, 30000);
  });
});
