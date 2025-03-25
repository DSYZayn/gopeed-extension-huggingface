/** 整理文件列表
 * @param {string} path
 * @param {string} branch
 * @param {import('@gopeed/types').FileInfo[]} data
 * @param {string} protocol
 * @param {string} baseUrl
 * @param {string} port
 * @returns {import('@gopeed/types').FileInfo[]}
 * */
export default function walkFiles(data, branch, path, protocol, baseUrl, port, repo) {
  if (data === undefined || data === null) {
    gopeed.logger.debug('walkFiles: data is undefined or null');
    return [];
  }
  gopeed.logger.debug('walkFiles: data is not undefined or null');
  return data.map((item) => {
    gopeed.logger.debug('item.path:', item.path);
    let aPath = path.replace('tree', 'resolve').replace('main', `${branch}`);
    if (branch == 'main' && path.includes('models')) {
      aPath = aPath.replace('models/', '');
    }
    let name = item.path;
    let bPath = '';
    if (name.includes('/')) {
      name = item.path.split('/');
      bPath = '/' + name.slice(0, -1).join('/');
      name = name[name.length - 1];
    }

    // e.g. aPath = /models/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M and bPath = /DeepSeek-R1-UD-IQ1_M
    // aPath = aPath.replace(bPath, ''); // 去除bPath， 但aPath可能存在与bPath重复的字符串
    aPath = aPath.replace(new RegExp(`${bPath}(?!.*${bPath})`, 'g'), ''); // 只删除最后一个与bPath相同的字符串
    gopeed.logger.debug('aPath:', aPath);
    gopeed.logger.debug('name:', name);
    gopeed.logger.debug('bPath:', bPath);
    return {
      name: name,
      path: `${repo}${bPath}`,
      size: item.size,
      req: {
        url: `${protocol}//${baseUrl}:${port}/${aPath}${bPath}/${name}`,
        extra: {
          header: {
            Cookie: gopeed.settings.cookie,
          },
        },
      },
    };
  });
}
