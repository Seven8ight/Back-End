#!/usr/bin/env node
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
var stream_1 = require("stream");
var chalk = require("chalk");
var path = require("path");
var dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
var MovieType;
(function (MovieType) {
    MovieType[MovieType["PLAYING"] = 0] = "PLAYING";
    MovieType[MovieType["POPULAR"] = 1] = "POPULAR";
    MovieType[MovieType["TOP"] = 2] = "TOP";
    MovieType[MovieType["UPCOMING"] = 3] = "UPCOMING";
    MovieType[MovieType["UNDEFINED"] = 4] = "UNDEFINED";
})(MovieType || (MovieType = {}));
var Events = new stream_1.EventEmitter();
var movieUrl, options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: "Bearer ".concat(process.env.TMDB_READ_TOKEN),
    },
};
Events.on("Retrieve movie type", function (movieType) {
    switch (movieType) {
        case MovieType.PLAYING:
            movieUrl =
                "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
            break;
        case MovieType.POPULAR:
            movieUrl =
                "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
            break;
        case MovieType.TOP:
            movieUrl =
                "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1";
            break;
        case MovieType.UPCOMING:
            movieUrl =
                "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1";
            break;
        default:
            movieUrl = undefined;
            break;
    }
});
Events.on("Display movie list", function (List, movieType) {
    var movieTypeString = "";
    if (movieType == MovieType.PLAYING)
        movieTypeString = "Currently Playing";
    else if (movieType == MovieType.POPULAR)
        movieTypeString = "Popular";
    else if (movieType == MovieType.TOP)
        movieTypeString = "Top movies";
    else if (movieType == MovieType.UPCOMING)
        movieTypeString = "Upcoming movies";
    else
        movieTypeString = "Undefined movie category";
    var maxDate, minDate;
    if (movieType != MovieType.POPULAR && movieType != MovieType.TOP) {
        if (List.dates) {
            maxDate = new Date(List.dates.maximum);
            minDate = new Date(List.dates.minimum);
            process.stdout.write("\n".concat(chalk.underline.green.bold(movieTypeString), "  "));
            process.stdout.write("  Between ".concat(chalk.green("".concat(minDate.getDate(), "-").concat(minDate.getMonth() + 1, "-").concat(minDate.getFullYear())), " and ").concat(chalk.green("".concat(maxDate.getDate(), "-").concat(maxDate.getMonth() + 1, "-").concat(maxDate.getFullYear())), "\n\n"));
        }
    }
    else
        process.stdout.write("\n".concat(chalk.underline.green.bold(movieTypeString), "\n\n"));
    List.results.forEach(function (movie) {
        process.stdout.write("".concat(chalk.grey("Title"), " - ").concat(chalk.whiteBright.underline("".concat(movie.title)), "\n"));
        process.stdout.write("".concat(chalk.grey("Original Title"), " - ").concat(chalk.whiteBright.underline("".concat(movie.title)), "\n"));
        process.stdout.write("".concat(chalk.grey("Original Languages"), " - ").concat(chalk.whiteBright.underline("".concat(movie.original_language)), "\n"));
        process.stdout.write("".concat(chalk.white("Adult"), " - ").concat(chalk.whiteBright.underline("".concat(movie.adult ? "Yes" : "No", "\n"))));
        process.stdout.write("\n ".concat(chalk.cyan("Overview"), " - ").concat(chalk.whiteBright("".concat(movie.overview)), "\n\n"));
        process.stdout.write("".concat(chalk.grey("Voter count"), " - ").concat(chalk.whiteBright("".concat(movie.vote_count, "\n"))));
        process.stdout.write("".concat(chalk.grey("Rating"), " - ").concat(movie.vote_average >= 7
            ? chalk.greenBright.underline("".concat(movie.vote_average))
            : movie.vote_average >= 5
                ? chalk.yellowBright.underline("".concat(movie.vote_average))
                : movie.vote_average == 0 && movie.vote_count <= 0
                    ? chalk.redBright.underline("Not rated")
                    : chalk.redBright.underline("".concat(movie.vote_average)), "\n"));
        process.stdout.write("------------------------------------------------------------------------------\n\n");
    });
});
Events.on("Fetch movie list", function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var fetchMovie;
    return __generator(this, function (_a) {
        if (url != undefined) {
            try {
                fetchMovie = https.get(url, options, function (response) {
                    var movieList = "";
                    response.on("data", function (data) {
                        movieList += data;
                    });
                    response.on("end", function () {
                        var movieType;
                        if (url.includes("top"))
                            movieType = MovieType.TOP;
                        else if (url.includes("now"))
                            movieType = MovieType.PLAYING;
                        else if (url.includes("popular"))
                            movieType = MovieType.POPULAR;
                        else if (url.includes("upcoming"))
                            movieType = MovieType.UPCOMING;
                        else
                            movieType = MovieType.UNDEFINED;
                        Events.emit("Display movie list", JSON.parse(movieList), movieType);
                    });
                });
                fetchMovie.on("finish", function () {
                    process.stdout.write("Finished fetching\n");
                });
                fetchMovie.on("error", function (error) {
                    process.stdout.write("".concat(chalk.redBright.underline("Error:"), " - ").concat(chalk.red.underline("".concat(error.message)), "\n"));
                });
                fetchMovie.end();
            }
            catch (error) {
                process.stdout.write("".concat(chalk.redBright.underline("Error"), " - ").concat(chalk.red.underline("".concat(error.message)), "\n"));
            }
        }
        else
            process.stdout.write("".concat(chalk.redBright.underline("Error"), " - ").concat(chalk.whiteBright.underline("Invalid movie category put in, try either popular, top, upcoming or playing"), "\n"));
        return [2 /*return*/];
    });
}); });
var args = process.argv.slice(2), flag = /^--type$/g.test(args[0]), movieType = "";
if (flag)
    movieType = args[1];
switch (movieType.toLowerCase()) {
    case "playing":
        Events.emit("Retrieve movie type", MovieType.PLAYING);
        break;
    case "popular":
        Events.emit("Retrieve movie type", MovieType.POPULAR);
        break;
    case "upcoming":
        Events.emit("Retrieve movie type", MovieType.UPCOMING);
        break;
    case "top":
        Events.emit("Retrieve movie type", MovieType.TOP);
        break;
    default:
        Events.emit("Retrieve movie type", MovieType.UNDEFINED);
        break;
}
Events.emit("Fetch movie list", movieUrl);
process.on("uncaughtException", function (error) {
    return process.stdout.write("".concat(chalk.redBright.underline("Error:"), " - ").concat(chalk.red.underline("".concat(error.message)), "\n"));
});
process.on("unhandledRejection", function (error) {
    return process.stdout.write("".concat(chalk.redBright.underline("Error:"), " - ").concat(chalk.red.underline("".concat(error.message)), "\n"));
});
