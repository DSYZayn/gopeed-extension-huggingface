gopeed.events.onResolve(async function (ctx) {
  /**
   * 获取模型元数据 || Get Model Metadata
   * @param {string} path
   * @returns {Promise<{name: string, files: {name: string, size: number, path: string?; req: {url: string}}[] | undefined}>}
   */
  async function getMetaData(path) {
    // hf-mirror或huggingface.co
    const apiPath = `https://hf-mirror.com/api/${path}`;
    gopeed.logger.debug('apiPath:', apiPath);
    const resp = await fetch(apiPath, {
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) throw new Error(`Failed to fetch ${apiPath}`);
    const data = await resp.json();
    /* eslint-disable no-undef */
    const result = await Promise.all(
      data.map(async (item) => {
        if (item.type === 'directory') return await getMetaData(`${path}/${item.path}`);
        return item;
      })
    );
    return result.flat(Infinity);
  }
  /** 整理文件列表
   * @param {string} path
   * @param {string} branch
   * @param {any} data
   * @param {string} protocol
   * @param {string} baseUrl
   * @param {string} port
   * @returns {{ name: string, path: string, size: string, req: {url: string}[]}}
   * */
  function walkFiles(data, branch, path, protocol, baseUrl, port, repo) {
    if (data === undefined || data === null) {
      gopeed.logger.debug('walkFiles: data is undefined or null');
      return [];
    }
    gopeed.logger.debug('walkFiles: data is not undefined or null');
    const files_list = data.map((item) => {
      gopeed.logger.debug('item.path:', item.path);
      let a_path = path.replace('tree', 'resolve').replace('main', `${branch}`);
      if (branch == 'main' && path.includes('models')) {
        a_path = a_path.replace('models/', '');
      }
      let name = item.path;
      let b_path = '';
      if (name.includes('/')) {
        name = item.path.split('/');
        b_path = '/' + name.slice(0, -1);
        name = name[name.length - 1];
      }

      // e.g. a_path = /models/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M and b_path = /DeepSeek-R1-UD-IQ1_M
      // a_path = a_path.replace(b_path, ''); // 去除b_path， 但a_path可能存在与b_path重复的字符串
      a_path = a_path.replace(new RegExp(`${b_path}(?!.*${b_path})`), ''); // 只删除最后一个与b_path相同的字符串
      gopeed.logger.debug('a_path:', a_path);
      gopeed.logger.debug('name:', name);
      gopeed.logger.debug('b_path:', b_path);
      return {
        name: name,
        path: `${repo}${b_path}`,
        size: item.size,
        req: {
          url: `${protocol}//${baseUrl}:${port}/${a_path}${b_path}/${name}`,
        },
      };
    });
    return files_list;
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
    let path = pathParts.join('/');
    path = path.replace('master', 'main');
    gopeed.logger.debug(path);
    gopeed.logger.debug(pathParts);

    const data = await getMetaData(path);
    ctx.res = {
      name: user,
      files: walkFiles(data, branch, path, protocol, baseUrl, port, repo),
    };
  } catch (err) {
    gopeed.logger.error('[HF Parser]', err);
    ctx.res = {
      name: 'Error',
      files: [],
    };
  }
});
