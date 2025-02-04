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
  try {
    var url = new URL(ctx.req.url);
    var baseUrl = url.host;
    var branch = baseUrl === 'www.modelscope.cn' ? 'master' : 'main';
    var protocol = url.protocol;
    var port = url.port || (protocol === 'https:' ? 443 : 80);
    var pathParts = url.pathname.substring(1).split('/');
    if (pathParts.includes('resolve')) {
      return;
    }
    if (pathParts[0] != 'models' && pathParts[0] != 'datasets' && pathParts[0] != 'spaces') {
      pathParts = ['models'].concat(_toConsumableArray(pathParts));
    }
    var _pathParts$slice = pathParts.slice(1, 3),
      _pathParts$slice2 = _slicedToArray(_pathParts$slice, 2),
      user = _pathParts$slice2[0],
      repo = _pathParts$slice2[1];
    // 构造API请求地址（兼容基础域名）
    var path = pathParts.join('/');
    path = path.replace('master', 'main');
    gopeed.logger.debug(path);
    var apiPath = "https://hf-mirror.com/api/".concat(path);
    gopeed.logger.debug(apiPath);
    var resp = await fetch(apiPath, {
      headers: {
        Accept: 'application/json'
      }
    });
    if (!resp.ok) throw new Error("API Error: ".concat(resp.status, " ").concat(await resp.text()));
    var data = await resp.json();
    // 递归解析文件结构
    var walkFiles = function walkFiles(items) {
      return items.flatMap(function (item) {
        if (item.type != 'file') {
          return [];
        }
        var name = item.path.split('/');
        name = name[name.length - 1];
        return {
          name: name,
          size: item.size,
          req: {
            url: "".concat(protocol, "//").concat(baseUrl, ":").concat(port, "/").concat(path.replace('tree', 'resolve').replace('main', "".concat(branch)), "/").concat(name)
          }
        };
      });
    };
    ctx.res = {
      name: "".concat(user, "-").concat(repo),
      files: walkFiles(data)
    };
  } catch (err) {
    console.error('[HF Parser]', err);
    ctx.res = {
      error: {
        message: "\u89E3\u6790\u5931\u8D25: ".concat(err.message),
        details: err.stack
      }
    };
  }
});
/******/ })()
;