#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var http = require("http");
var https = require("https");
var url_1 = require("url");
var Cache_1 = require("./Cache/Cache");
var args = process.argv.slice(2), Cachedb = new Cache_1.CacheDB();
var options = {};
args.forEach(function (arg, index, arr) {
    if (!arg.includes("clear-cache")) {
        if (arg.includes("--") && !arr[index + 1].includes("--"))
            options[arg.replace(/-+/g, "")] = arr[index + 1];
    }
    else
        options["clear_cache"] = "yes";
});
if (options.port && options.origin) {
    var server = http.createServer(function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
        var requestUrl, requestParams, params, urlOptions, networkRequest, url_2, cacheHit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!request.url) return [3 /*break*/, 6];
                    requestUrl = new url_1.URL(request.url, "http://".concat(request.headers.host)), requestParams = requestUrl === null || requestUrl === void 0 ? void 0 : requestUrl.pathname, params = requestParams && requestParams.split("/").filter(Boolean);
                    if (!Array.isArray(params)) return [3 /*break*/, 4];
                    if (!(params.length > 0)) return [3 /*break*/, 2];
                    urlOptions = {
                        headers: {
                            accept: "application/json",
                        },
                    };
                    networkRequest = void 0, url_2 = "".concat(options.origin, "/").concat(params.join("/"));
                    return [4 /*yield*/, Cachedb.retrieveResponse(url_2)];
                case 1:
                    cacheHit = _a.sent();
                    if (cacheHit == null) {
                        if (options.origin.includes("https")) {
                            networkRequest = https.request(url_2, urlOptions, function (res) {
                                var responseData = "";
                                res.on("error", function (error) {
                                    response.writeHead(500);
                                    response.end(JSON.stringify({
                                        Error: "Request incomplete, ".concat(error.message),
                                    }));
                                });
                                res.on("data", function (data) { return (responseData += data); });
                                res.on("end", function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var jsonResponseData, cacheSave, error_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                jsonResponseData = JSON.parse(responseData);
                                                return [4 /*yield*/, Cachedb.cacheResponse(url_2, res.headers, jsonResponseData)];
                                            case 1:
                                                cacheSave = _a.sent();
                                                response.writeHead(200);
                                                response.end(JSON.stringify(__assign({ FromCache: false, SavedInCache: cacheSave ? true : false }, jsonResponseData)));
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_1 = _a.sent();
                                                response.writeHead(500);
                                                response.end(JSON.stringify({
                                                    Error: error_1.message,
                                                }));
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            });
                        }
                        else {
                            networkRequest = http.request(url_2, urlOptions, function (res) {
                                var responseData = "";
                                res.on("error", function (error) {
                                    response.writeHead(500);
                                    response.end(JSON.stringify({
                                        Error: "Request incomplete, ".concat(error.message),
                                    }));
                                });
                                res.on("data", function (data) { return (responseData += data); });
                                res.on("end", function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var jsonResponseData, cacheSave, error_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                jsonResponseData = JSON.parse(responseData);
                                                return [4 /*yield*/, Cachedb.cacheResponse(url_2, res.headers, jsonResponseData)];
                                            case 1:
                                                cacheSave = _a.sent();
                                                response.writeHead(200);
                                                response.end(JSON.stringify(__assign({ FromCache: false, SavedInCache: cacheSave ? true : false }, jsonResponseData)));
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_2 = _a.sent();
                                                response.writeHead(500);
                                                response.end(JSON.stringify({
                                                    Error: error_2.message,
                                                }));
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            });
                        }
                        networkRequest.on("error", function (error) {
                            return process.stdout.write("Error occured on request: ".concat(error.message));
                        });
                        networkRequest.end();
                    }
                    else {
                        response.writeHead(200);
                        response.end(JSON.stringify(__assign({ FromCache: true }, cacheHit.Result)));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    response.writeHead(200);
                    response.end(JSON.stringify("Cache server listening at port ".concat(options.port)));
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    response.writeHead(409);
                    response.end(JSON.stringify({
                        Error: "Invalid route parameters passed in\n",
                    }));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    response.writeHead(500);
                    response.end(JSON.stringify({
                        Error: "Request url invalid, server error, kindly try again\n",
                    }));
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); });
    server.listen(options.port, function () {
        return process.stdout.write("Server started at port: ".concat(options.port));
    });
}
else if (options.clear_cache)
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var clear;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Cachedb.clearCache()];
                case 1:
                    clear = _a.sent();
                    if (clear)
                        process.stdout.write("Cache cleared\n");
                    else
                        process.stdout.write("Error occured in clearing cache\n");
                    return [2 /*return*/];
            }
        });
    }); })();
else
    process.stdout.write("Please ensure to provide a port number and origin url for forwarding requests to or pass in --clear-cache true to clear the cache file");
