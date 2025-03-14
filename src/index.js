gopeed.events.onResolve(async function (ctx) {
  /**
   * 获取模型元数据 || Get Model Metadata
   * @param {string} basePath - 基础路径. e.g. models/KwaiVGI/LivePortrait/tree/main,
   * @param {string} filepath - 文件路径. e.g. insightface/models/buffalo_l
   * @returns {Promise<import('@gopeed/types').FileInfo[]>}
   */
  async function getMetaData(basePath, filepath) {
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
    /* eslint-disable no-undef */
    const result = await Promise.all(
      data.map(async (item) => {
        if (item.type === 'directory') return await getMetaData(basePath, item.path);
        return item;
      })
    );
    return result.flat(Infinity);
  }
  /** 整理文件列表
   * @param {string} path
   * @param {string} branch
   * @param {import('@gopeed/types').FileInfo[]} data
   * @param {string} protocol
   * @param {string} baseUrl
   * @param {string} port
   * @returns {import('@gopeed/types').FileInfo[]}
   * */
  function walkFiles(data, branch, path, protocol, baseUrl, port, repo) {
    if (data === undefined || data === null) {
      gopeed.logger.debug('walkFiles: data is undefined or null');
      return [];
    }
    gopeed.logger.debug('walkFiles: data is not undefined or null');
    return data.map((item) => {
      gopeed.logger.debug('item.path:', item.path);
      let a_path = path.replace('tree', 'resolve').replace('main', `${branch}`);
      if (branch == 'main' && path.includes('models')) {
        a_path = a_path.replace('models/', '');
      }
      let name = item.path;
      let b_path = '';
      if (name.includes('/')) {
        name = item.path.split('/');
        b_path = '/' + name.slice(0, -1).join('/');
        name = name[name.length - 1];
      }

      // e.g. a_path = /models/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M and b_path = /DeepSeek-R1-UD-IQ1_M
      // a_path = a_path.replace(b_path, ''); // 去除b_path， 但a_path可能存在与b_path重复的字符串
      a_path = a_path.replace(new RegExp(`${b_path}(?!.*${b_path})`, 'g'), ''); // 只删除最后一个与b_path相同的字符串
      gopeed.logger.debug('a_path:', a_path);
      gopeed.logger.debug('name:', name);
      gopeed.logger.debug('b_path:', b_path);
      return {
        name: name,
        path: `${repo}${b_path}`,
        size: item.size,
        req: {
          url: `${protocol}//${baseUrl}:${port}/${a_path}${b_path}/${name}`,
          extra: {
            header: {
              Cookie: gopeed.settings.cookie,
            },
          },
        },
      };
    });
  }

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

    let filepath = '';
    /**
     * 构建basePathParts
     * @param {string} pathParts
     * @returns {string []} basePathParts
     */
    const basePathParts = (pathParts) => {
      if (pathParts.length === 0) return [];
      if (pathParts[pathParts.length - 2] === 'tree') {
        return pathParts;
      }
      gopeed.logger.debug('basePathParts:', pathParts);
      filepath = filepath === '' ? pathParts.pop() : pathParts.pop() + '/' + filepath;
      gopeed.logger.debug('function basePathParts--filepath:', filepath);
      return basePathParts(pathParts);
    };
    let basePath = basePathParts(pathParts).join('/');
    basePath = basePath.replace('master', 'main');

    const data = await getMetaData(basePath, filepath);
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
