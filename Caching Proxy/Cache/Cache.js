"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheDB = void 0;
var fs = require("fs/promises");
var path = require("path");
var CacheDB = /** @class */ (function () {
    function CacheDB() {
    }
    CacheDB.prototype.cacheFileExistence = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.readFile(path.join(__dirname, "Cache.json"), {
                                encoding: "utf-8",
                            })];
                    case 1:
                        file = _a.sent();
                        JSON.parse(file);
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CacheDB.prototype.createCacheFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileContent = {
                            Cache: [],
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(__dirname, "Cache.json"), JSON.stringify(fileContent), {
                                encoding: "utf-8",
                                flag: "w",
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheDB.prototype.cacheResponse = function (url, headers, Response) {
        return __awaiter(this, void 0, void 0, function () {
            var contents, contentsParsed, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(url.length > 0 && Response != null)) return [3 /*break*/, 11];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 10]);
                        return [4 /*yield*/, this.cacheFileExistence()];
                    case 2:
                        if (!((_a.sent()) == false)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createCacheFile()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, fs.readFile(path.join(__dirname, "Cache.json"), {
                            encoding: "utf-8",
                        })];
                    case 5:
                        contents = _a.sent(), contentsParsed = JSON.parse(contents);
                        contentsParsed.Cache.push({
                            url: url,
                            Result: {
                                Headers: headers,
                                Response: Response,
                            },
                        });
                        return [4 /*yield*/, fs.writeFile(path.join(__dirname, "Cache.json"), JSON.stringify(contentsParsed), {
                                encoding: "utf-8",
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_2 = _a.sent();
                        if (!(error_2 instanceof Error)) return [3 /*break*/, 9];
                        if (!error_2.message.includes("not exist")) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.createCacheFile()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, false];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        process.stdout.write("Error in caching, url may be null or response is null");
                        return [2 /*return*/, false];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    CacheDB.prototype.retrieveResponse = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var contents, cache, cacheFind, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(url.length > 0)) return [3 /*break*/, 8];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 7]);
                        return [4 /*yield*/, fs.readFile(path.join(__dirname, "Cache.json"), {
                                encoding: "utf-8",
                            })];
                    case 2:
                        contents = _a.sent(), cache = JSON.parse(contents);
                        if (cache.Cache) {
                            cacheFind = cache.Cache.find(function (cache) { return cache.url == url; });
                            if (cacheFind)
                                return [2 /*return*/, cacheFind];
                            return [2 /*return*/, null];
                        }
                        else
                            return [2 /*return*/, null];
                        return [3 /*break*/, 7];
                    case 3:
                        error_3 = _a.sent();
                        if (!(error_3 instanceof Error)) return [3 /*break*/, 6];
                        if (!error_3.message.includes("not exist")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.createCacheFile()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        process.stdout.write("".concat(error_3.message));
                        _a.label = 6;
                    case 6: return [2 /*return*/, null];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        process.stdout.write("URL length is invalid");
                        return [2 /*return*/, null];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    CacheDB.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.writeFile(path.join(__dirname, "Cache.json"), JSON.stringify({
                                Cache: [],
                            }), { encoding: "utf-8" })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        if (error_4 instanceof Error)
                            process.stdout.write("Error: ".concat(error_4.message));
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CacheDB;
}());
exports.CacheDB = CacheDB;
