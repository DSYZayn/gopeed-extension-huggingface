/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/getMetaData.js":
/*!********************************!*\
  !*** ./src/api/getMetaData.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getMetaData)
/* harmony export */ });
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
  var result = await Promise.all(data.map(async function (item) {
    if (item.type === 'directory') return await getMetaData(basePath, item.path);
    return item;
  }));
  return result.flat(Infinity);
}

/***/ }),

/***/ "./src/api/prepare.js":
/*!****************************!*\
  !*** ./src/api/prepare.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ prepare)
/* harmony export */ });
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
/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-03-12 12:35:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 12:50:42
 * @FilePath: \gopeed-extension-huggingface\src\api\prepare.js
 * @Description:
 *
 */

/**
 * Prepares the necessary information for accessing a repository based on the provided URL.
 * This function is designed to parse the URL and extract user, repository, branch, and other information required for accessing the repository.
 * @param {URL} url - The URL object containing the address of the repository.
 * @returns {Object} Returns an object containing baseUrl, user, repo, branch, protocol, port, and pathParts.
 */
function prepare(url) {
  // 构造API请求地址（兼容基础域名）
  // 由于modelscope缺乏高效的元信息获取API，统一使用hf-mirror来获取元信息
  // 因此暂时只支持下载modelscope中与hf-mirror同名的数据
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
  return {
    baseUrl: baseUrl,
    user: user,
    repo: repo,
    branch: branch,
    protocol: protocol,
    port: port,
    pathParts: pathParts
  };
}

/***/ }),

/***/ "./src/api/resolveBasePathParts.js":
/*!*****************************************!*\
  !*** ./src/api/resolveBasePathParts.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ resolveBasePathParts)
/* harmony export */ });
/**
 * 解析basePathParts
 *
 * @param {string []} pathParts
 * @returns {string [], string} basePathParts, filepath
 */
function resolveBasePathParts(pathParts) {
  var filePath = '';
  /**
   * 构建basePathParts
   * @param {string} pathParts
   * @returns {[string, string]} [basePath, filepath]
   */
  var _basePathParts = function basePathParts(pathParts) {
    if (pathParts.length === 0) return [];
    if (pathParts[pathParts.length - 2] === 'tree') {
      return pathParts;
    }
    gopeed.logger.debug('basePathParts:', pathParts);
    filePath = filePath === '' ? pathParts.pop() : pathParts.pop() + '/' + filePath;
    gopeed.logger.debug('function basePathParts--filepath:', filePath);
    return _basePathParts(pathParts);
  };
  var basePath = _basePathParts(pathParts).join('/').replace('master', 'main');
  return [basePath, filePath];
}

/***/ }),

/***/ "./src/api/walkFiles.js":
/*!******************************!*\
  !*** ./src/api/walkFiles.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ walkFiles)
/* harmony export */ });
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
  return data.map(function (item) {
    gopeed.logger.debug('item.path:', item.path);
    var aPath = path.replace('tree', 'resolve').replace('main', "".concat(branch));
    if (branch == 'main' && path.includes('models')) {
      aPath = aPath.replace('models/', '');
    }
    var name = item.path;
    var bPath = '';
    if (name.includes('/')) {
      name = item.path.split('/');
      bPath = '/' + name.slice(0, -1).join('/');
      name = name[name.length - 1];
    }

    // e.g. aPath = /models/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M and bPath = /DeepSeek-R1-UD-IQ1_M
    // aPath = aPath.replace(bPath, ''); // 去除bPath， 但aPath可能存在与bPath重复的字符串
    aPath = aPath.replace(new RegExp("".concat(bPath, "(?!.*").concat(bPath, ")"), 'g'), ''); // 只删除最后一个与bPath相同的字符串
    gopeed.logger.debug('aPath:', aPath);
    gopeed.logger.debug('name:', name);
    gopeed.logger.debug('bPath:', bPath);
    return {
      name: name,
      path: "".concat(repo).concat(bPath),
      size: item.size,
      req: {
        url: "".concat(protocol, "//").concat(baseUrl, ":").concat(port, "/").concat(aPath).concat(bPath, "/").concat(name),
        extra: {
          header: {
            Cookie: gopeed.settings.cookie
          }
        }
      }
    };
  });
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api_prepare_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api/prepare.js */ "./src/api/prepare.js");
/* harmony import */ var _api_resolveBasePathParts_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api/resolveBasePathParts.js */ "./src/api/resolveBasePathParts.js");
/* harmony import */ var _api_getMetaData_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api/getMetaData.js */ "./src/api/getMetaData.js");
/* harmony import */ var _api_walkFiles_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api/walkFiles.js */ "./src/api/walkFiles.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/*
 * @Author: zayn dongsy2003@163.com
 * @Date: 2025-02-04 02:34:49
 * @LastEditors: zayn dongsy2003@163.com
 * @LastEditTime: 2025-03-12 13:43:56
 * @FilePath: \gopeed-extension-huggingface\src\index.js
 * @Description: 入口文件
 */




gopeed.events.onResolve(async function (ctx) {
  try {
    var url = new URL(ctx.req.url); // e.g. https://hf-mirror.com/unsloth/DeepSeek-R1-GGUF/tree/main/DeepSeek-R1-UD-IQ1_M

    var _prepare = (0,_api_prepare_js__WEBPACK_IMPORTED_MODULE_0__["default"])(url),
      baseUrl = _prepare.baseUrl,
      user = _prepare.user,
      repo = _prepare.repo,
      branch = _prepare.branch,
      protocol = _prepare.protocol,
      port = _prepare.port,
      pathParts = _prepare.pathParts;
    var _resolveBasePathParts = (0,_api_resolveBasePathParts_js__WEBPACK_IMPORTED_MODULE_1__["default"])(pathParts),
      _resolveBasePathParts2 = _slicedToArray(_resolveBasePathParts, 2),
      basePath = _resolveBasePathParts2[0],
      filePath = _resolveBasePathParts2[1];
    var data = await (0,_api_getMetaData_js__WEBPACK_IMPORTED_MODULE_2__["default"])(basePath, filePath);
    ctx.res = {
      name: user,
      files: (0,_api_walkFiles_js__WEBPACK_IMPORTED_MODULE_3__["default"])(data, branch, basePath, protocol, baseUrl, port, repo)
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
})();

/******/ })()
;