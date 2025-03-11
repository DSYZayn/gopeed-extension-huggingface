/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-11 13:29:03
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-11 13:42:16
 * @FilePath: \gopeed-extension-huggingface\src\index.test.js
 * @Description:
 */
// src/index.test.js
const { events } = require('./index');

jest.mock('./api/getMetaData.js', () => jest.fn());
jest.mock('./api/walkFiles.js', () => jest.fn());
jest.mock('./api/resolveBasePathParts.js', () => jest.fn());

describe('index.js', () => {
  let ctx;
  let getMetaDataMock;
  let walkFilesMock;
  let resolveBasePathPartsMock;

  beforeEach(() => {
    ctx = {
      req: { url: 'https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M' },
      res: null,
    };

    getMetaDataMock = require('./api/getMetaData.js');
    walkFilesMock = require('./api/walkFiles.js');
    resolveBasePathPartsMock = require('./api/resolveBasePathParts.js');

    getMetaDataMock.mockResolvedValue({
      /* mock data */
    });
    walkFilesMock.mockReturnValue([
      {
        /* mock file */
      },
    ]);
    resolveBasePathPartsMock.mockReturnValue(['basePath', 'filePath']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle event with valid URL', async () => {
    await events.onResolve(ctx);
    expect(getMetaDataMock).toHaveBeenCalledWith('basePath', 'filePath');
    expect(walkFilesMock).toHaveBeenCalledWith(
      {
        /* mock data */
      },
      'main',
      'basePath',
      'https:',
      'hf-mirror.com',
      443,
      'DeepSeek-R1-GGUF'
    );
    expect(ctx.res).toEqual({
      name: 'unsloth',
      files: [
        {
          /* mock file */
        },
      ],
    });
  });

  test('should handle event with invalid URL', async () => {
    ctx.req.url = 'https://invalid-url.com';
    await events.onResolve(ctx);
    expect(ctx.res).toEqual({
      name: 'Error',
      files: [],
    });
  });

  test('should complete path if it does not start with models, datasets, or spaces', async () => {
    ctx.req.url = 'https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M';
    await events.onResolve(ctx);
    expect(resolveBasePathPartsMock).toHaveBeenCalledWith([
      'unsloth',
      'DeepSeek-R1-GGUF',
      'tree',
      'main',
      'DeepSeek-R1-UD-IQ1_M',
    ]);
  });

  test('should remove trailing slash from path', async () => {
    ctx.req.url = 'https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M/';
    await events.onResolve(ctx);
    expect(resolveBasePathPartsMock).toHaveBeenCalledWith([
      'unsloth',
      'DeepSeek-R1-GGUF',
      'tree',
      'main',
      'DeepSeek-R1-UD-IQ1_M',
    ]);
  });

  test('should not resolve if path includes resolve or spaces', async () => {
    ctx.req.url = 'https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/resolve/main/DeepSeek-R1-UD-IQ1_M';
    await events.onResolve(ctx);
    expect(getMetaDataMock).not.toHaveBeenCalled();
    expect(walkFilesMock).not.toHaveBeenCalled();
    expect(ctx.res).toBeNull();

    ctx.req.url = 'https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/spaces/main/DeepSeek-R1-UD-IQ1_M';
    await events.onResolve(ctx);
    expect(getMetaDataMock).not.toHaveBeenCalled();
    expect(walkFilesMock).not.toHaveBeenCalled();
    expect(ctx.res).toBeNull();
  });

  test('should handle http protocol correctly', async () => {
    ctx.req.url = 'http://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M';
    await events.onResolve(ctx);
    expect(walkFilesMock).toHaveBeenCalledWith(
      {
        /* mock data */
      },
      'main',
      'basePath',
      'http:',
      'hf-mirror.com',
      80,
      'DeepSeek-R1-GGUF'
    );
  });

  test('should handle www.modelscope.cn correctly', async () => {
    ctx.req.url = 'https://www.modelscope.cn/unsloth/DeepSeek-R1-GGUF/tree/master/DeepSeek-R1-UD-IQ1_M';
    await events.onResolve(ctx);
    expect(walkFilesMock).toHaveBeenCalledWith(
      {
        /* mock data */
      },
      'master',
      'basePath',
      'https:',
      'www.modelscope.cn',
      443,
      'DeepSeek-R1-GGUF'
    );
  });
});
