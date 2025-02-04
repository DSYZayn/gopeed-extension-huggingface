gopeed.events.onResolve(async function (ctx) {
  try {
    let url = new URL(ctx.req.url);
    const baseUrl = url.host;
    const branch = baseUrl === 'www.modelscope.cn' ? 'master' : 'main';
    const protocol = url.protocol;
    const port = url.port || (protocol === 'https:' ? 443 : 80);
    let pathParts = url.pathname.substring(1).split('/');
    if (pathParts.includes('resolve')) {
      return;
    }
    if (pathParts[0] != 'models' && pathParts[0] != 'datasets' && pathParts[0] != 'spaces') {
      pathParts = ['models', ...pathParts];
    }
    // 构造API请求地址（兼容基础域名）
    let path = pathParts.join('/');
    path = path.replace('master', 'main');
    gopeed.logger.debug(path);
    const apiPath = `https://hf-mirror.com/api/${path}`;
    gopeed.logger.debug(apiPath);
    const resp = await fetch(apiPath, {
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) throw new Error(`API Error: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    // 递归解析文件结构
    const walkFiles = (items) => {
      return items.flatMap((item) => {
        if (item.type != 'file') {
          return [];
        }
        if (branch == 'main' && path.includes('models')) {
          path = path.replace('models/', '');
        }
        let name = item.path.split('/');
        name = name[name.length - 1];
        return {
          name: name,
          size: item.size,
          req: {
            url: `${protocol}//${baseUrl}:${port}/${path.replace('tree', 'resolve').replace('main', `${branch}`)}/${name}`,
          },
        };
      });
    };

    gopeed.logger.debug(pathParts);
    let folderName = pathParts
      .filter((item) => item != 'tree' && item != 'main' && item != 'models' && item != 'datasets')
      .join('_');
    ctx.res = {
      name: folderName,
      files: walkFiles(data),
    };
  } catch (err) {
    console.error('[HF Parser]', err);
    ctx.res = {
      error: {
        message: `解析失败: ${err.message}`,
        details: err.stack,
      },
    };
  }
});
