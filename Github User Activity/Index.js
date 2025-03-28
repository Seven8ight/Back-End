#!usr/env/node
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
var https = require("https");
var chalk = require("chalk");
if (process.argv.length <= 2) {
    console.log("\n        Invalid username passed in,\n        To place in a command add the flag github='username'\n    ");
    process.exit(1);
}
else {
    var username_1 = process.argv[2].split("=")[1];
    if (username_1 != null || username_1 != undefined) {
        var requestCallback = function (response) { return __awaiter(void 0, void 0, void 0, function () {
            var responseData_1;
            return __generator(this, function (_a) {
                try {
                    responseData_1 = "";
                    if (response.statusCode != 200) {
                        response.resume();
                        throw "Request failed, expected status code of 200, instead got ".concat(response.statusCode);
                    }
                    response.on("data", function (data) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (data)
                                responseData_1 += data.toString();
                            return [2 /*return*/];
                        });
                    }); });
                    response.on("error", function (error) {
                        process.stdout.write(error.message);
                    });
                    response.on("end", function () {
                        var userData = JSON.parse(responseData_1);
                        if (userData.length == 0)
                            console.log("No user of such username exists");
                        else {
                            userData.forEach(function (Data) {
                                switch (Data.type) {
                                    case "PullRequestEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " made a ").concat(chalk.blue("pull request"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "PushEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " made ").concat(chalk.redBright.underline(Data.payload.commits.length, Data.payload.commits.length > 1 ? "commits" : "commit"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "CreateEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " made a ").concat(chalk.underline.greenBright("fork"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "IssueCommentEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " posted an ").concat(chalk.magentaBright("issue"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "IssuesEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " posted some ").concat(chalk.magentaBright("issues"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "PullRequestReviewEvent":
                                        console.log(" - ".concat(chalk.underline(username_1), " began ").concat(chalk.magentaBright("reviewing"), " ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "ForkEvent":
                                        console.log(" - ".concat(username_1, " created a ").concat(chalk.cyanBright("fork"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    case "WatchEvent":
                                        console.log(" - ".concat(username_1, " started ").concat(chalk.blueBright("watching"), " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                        break;
                                    default:
                                        console.log(" - ".concat(chalk.underline(username_1), " made a ").concat(Data.type, " on ").concat(chalk.underline.whiteBright(Data.repo.name)));
                                }
                            });
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                }
                return [2 /*return*/];
            });
        }); }, githubRequest = https.get("https://api.github.com/users/".concat(username_1, "/events?per_page=5"), {
            headers: {
                accept: "application/json",
                "user-agent": "node.js",
            },
        }, requestCallback);
        githubRequest.on("error", function (error) {
            console.log(error);
        });
        githubRequest.end();
    }
    else
        console.log("Invalid argument passed in, ensure the flag, github is used as e.g. github=<username>");
}
