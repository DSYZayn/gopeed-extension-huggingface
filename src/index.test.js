/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-12 13:44:00
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 14:23:46
 * @FilePath: \gopeed-extension-huggingface\src\index.test.js
 * @Description: 单元测试文件
 */
import { readFile } from 'fs/promises';
import jest from '@jest/globals';
const { describe, it, expect } = jest;

describe('gopeed.events.onResolve', () => {
  const links = [
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main',
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo',
    'https://huggingface.co/zaynchen/gopeed-extension-huggingface/tree/main/mock-repo/models',
  ];

  links.forEach((link, index) => {
    it(`should return the correct response for link ${link}`, async () => {
      const ctx = {
        req: { url: link },
        res: {},
      };

      await gopeed.events.onResolve(ctx);

      const expectedFilePath = `assets/result_${index + 1}.json`;
      const expectedResult = JSON.parse(await readFile(new URL(expectedFilePath, import.meta.url)));

      expect(ctx.res).toEqual(expectedResult);
    });
  });
});
