/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
gopeed.events.onResolve(async function (ctx) {
  /**
   * 获取模型元数据 || Get Model Metadata
   * @param {string} basePath - 基础路径. e.g. models/KwaiVGI/LivePortrait/tree/main,
   * @param {string} filepath - 文件路径. e.g. insightface/models/buffalo_l
   * @returns {Promise<import('@gopeed/types').FileInfo[]>}
   */
  async function getMetaData(basePath, filepath) {
    gopeed.logger.debug('basePath:', basePath, 'filepath:', filepath);
    var path = filepath ? "".concat(basePath, "/").concat(filepath) : basePath;
    // hf-mirror或huggingface.co
    var apiPath = "https://hf-mirror.com/api/".concat(path);
    gopeed.logger.debug('apiPath:', apiPath, 'path:', path);
    var resp = await fetch(apiPath, {
      headers: {
        Accept: 'application/json'
      }
    });
    if (!resp.ok) throw new Error("Failed to fetch ".concat(apiPath));
    var data = await resp.json();
    /* eslint-disable no-undef */
    var result = await Promise.all(data.map(async function (item) {
      if (item.type === 'directory') return await getMetaData(basePath, item.path);
      return item;
    }));
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
    var files_list = data.map(function (item) {
      gopeed.logger.debug('item.path:', item.path);
      var a_path = path.replace('tree', 'resolve').replace('main', "".concat(branch));
      if (branch == 'main' && path.includes('models')) {
        a_path = a_path.replace('models/', '');
      }
      var name = item.path;
      var b_path = '';
      if (name.includes('/')) {
        name = item.path.split('/');
        b_path = '/' + name.slice(0, -1).join('/');
        name = name[name.length - 1];
      }

      // e.g. a_path = /models/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M and b_path = /DeepSeek-R1-UD-IQ1_M
      // a_path = a_path.replace(b_path, ''); // 去除b_path， 但a_path可能存在与b_path重复的字符串
      a_path = a_path.replace(new RegExp("".concat(b_path, "(?!.*").concat(b_path, ")"), 'g'), ''); // 只删除最后一个与b_path相同的字符串
      gopeed.logger.debug('a_path:', a_path);
      gopeed.logger.debug('name:', name);
      gopeed.logger.debug('b_path:', b_path);
      return {
        name: name,
        path: "".concat(repo).concat(b_path),
        size: item.size,
        req: {
          url: "".concat(protocol, "//").concat(baseUrl, ":").concat(port, "/").concat(a_path).concat(b_path, "/").concat(name)
        }
      };
    });
    return files_list;
  }
  try {
    var url = new URL(ctx.req.url); // e.g. https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M
    var baseUrl = url.host; // e.g. hf-mirror.com
    var branch = baseUrl === 'www.modelscope.cn' ? 'master' : 'main';
    var protocol = url.protocol; // Generally https: or http:
    var port = url.port || (protocol === 'https:' ? 443 : 80); // Explicit port for https: or http:, default 80 for http:, 443 for https:
    var pathParts = url.pathname.substring(1).split('/'); //e.g. [unsloth, DeepSeek-R1-GGUF, tree, main, DeepSeek-R1-UD-IQ1_M]
    if (pathParts.includes('resolve') || pathParts.includes('spaces')) {
      return; // 不解析单文件 || Don't resolve single file.
    }
    if (pathParts[pathParts.length - 1] === '') {
      pathParts.pop();
    }
    if (pathParts[0] != 'models' && pathParts[0] != 'datasets' && pathParts[0] != 'spaces') {
      pathParts = ['models'].concat(_toConsumableArray(pathParts)); // 补齐路径：models/ || Complete path: models/
    }
    var _pathParts$slice = pathParts.slice(1, 3),
      _pathParts$slice2 = _slicedToArray(_pathParts$slice, 2),
      user = _pathParts$slice2[0],
      repo = _pathParts$slice2[1];
    if (pathParts.length === 3) {
      // 补齐路径: /models/tree/main
      pathParts = [].concat(_toConsumableArray(pathParts), ['tree', 'main']);
    }
    gopeed.logger.debug('user:', user, 'repo:', repo);
    // 构造API请求地址（兼容基础域名）
    // 由于modelscope缺乏高效的元信息获取API，统一使用hf-mirror来获取元信息
    // 因此暂时只支持下载modelscope中与hf-mirror同名的数据

    var filepath = '';
    /**
     * 构建basePathParts
     * @param {string} pathParts
     * @returns {string []} basePathParts
     */
    var _basePathParts = function basePathParts(pathParts) {
      if (pathParts.length === 0) return [];
      if (pathParts[pathParts.length - 2] === 'tree') {
        return pathParts;
      }
      gopeed.logger.debug('basePathParts:', pathParts);
      filepath = filepath === '' ? pathParts.pop() : pathParts.pop() + '/' + filepath;
      gopeed.logger.debug('function basePathParts--filepath:', filepath);
      return _basePathParts(pathParts);
    };
    var basePath = _basePathParts(pathParts).join('/');
    basePath = basePath.replace('master', 'main');
    var data = await getMetaData(basePath, filepath);
    ctx.res = {
      name: user,
      files: walkFiles(data, branch, basePath, protocol, baseUrl, port, repo)
    };
    gopeed.logger.debug('ctx.res:', JSON.stringify(ctx.res));
  } catch (err) {
    gopeed.logger.error('[HF Parser]', err);
    ctx.res = {
      name: 'Error',
      files: []
    };
  }
});
/******/ })()
;