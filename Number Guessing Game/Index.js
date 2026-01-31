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
var node_events_1 = require("node:events");
var node_readline_1 = require("node:readline");
var fs = require("fs/promises");
var path = require("path");
var chalk = require("chalk");
var guessAttempts = 0, timer = 0, timerHandler, correctAnswer, currentDifficulty = null, currentHighscore = {
    Highscore: 0,
    Times: 0,
};
var generateAnswer = function () { return Math.floor(Math.random() * 100) + 1; }, gameEvents = new node_events_1.EventEmitter(), inputInterface = (0, node_readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout,
});
var retry = function (status, time, answer) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (status == "win") {
                console.log(chalk.greenBright("\nCorrect! It took you ".concat(time, "s to figure it out.\n")));
            }
            else {
                console.log(chalk.redBright("\nYou lose. ") +
                    chalk.gray("The correct answer was ".concat(answer, "\n")));
            }
            clearInterval(timerHandler);
            timer = 0;
            inputInterface.question("Want to try again (y/n): ", function (response) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (response.toLowerCase().includes("y")) {
                        guessAttempts = 0;
                        gameEvents.emit("Begin");
                    }
                    else {
                        console.log(chalk.whiteBright.underline("\nThank you for playing!\n"));
                        highscoreWrite().then(function () { return process.exit(0); });
                    }
                    return [2 /*return*/];
                });
            }); });
        }
        catch (error) {
            console.log(error);
        }
        return [2 /*return*/];
    });
}); }, highscoreWrite = function () { return __awaiter(void 0, void 0, void 0, function () {
    var highscores, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = JSON).parse;
                return [4 /*yield*/, fs.readFile(path.join(__dirname, "Highscores.json"), {
                        encoding: "utf-8",
                    })];
            case 1:
                highscores = _b.apply(_a, [_c.sent()]);
                currentHighscore.Round = highscores.Highscores.length + 1;
                highscores.Highscores.push(currentHighscore);
                highscores.Highscores.sort(function (previous, current) { return current.Highscore - previous.Highscore; });
                return [4 /*yield*/, fs.writeFile(path.join(__dirname, "Highscores.json"), JSON.stringify(__assign({}, highscores)))];
            case 2:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
gameEvents.once("Highscore Storage", function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs.writeFile("./Highscores.json", JSON.stringify({
                        Highscores: [],
                    }), {
                        flag: "wx",
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1.code == "EEXIST") {
                    return [2 /*return*/];
                }
                console.log(chalk.redBright("Error in creating file, try again"));
                console.log(error_1);
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); });
gameEvents.on("Begin", function () {
    console.clear();
    guessAttempts = 0;
    currentDifficulty = null;
    correctAnswer = generateAnswer();
    console.log(chalk.whiteBright.bold.underline("\nNumber-guessing game\n\n") +
        chalk.whiteBright("I'm thinking of a number between 1 and 100\n") +
        chalk.whiteBright("Select a difficulty level:\n\n") +
        chalk.gray("1. Easy (10 attempts)\n") +
        chalk.yellowBright("2. Medium (5 attempts)\n") +
        chalk.redBright("3. Hard (3 attempts)\n\n"));
    gameEvents.removeAllListeners("Ask");
    gameEvents.on("Ask", function () {
        inputInterface.question("Enter difficulty (1,2 or 3): ", function (answer) {
            var choice = parseInt(answer);
            if (![1, 2, 3].includes(choice)) {
                console.log(chalk.redBright("Invalid input, please enter 1, 2, or 3."));
                gameEvents.emit("Ask");
            }
            else {
                currentDifficulty =
                    choice === 1 ? "easy" : choice === 2 ? "medium" : "hard";
                timerHandler = setInterval(function () { return (timer += 1); }, 1000);
                gameEvents.emit("Attempts", currentDifficulty);
            }
        });
    });
    gameEvents.emit("Ask");
});
gameEvents.on("Attempts", function (difficulty) {
    var maxAttempts = difficulty === "easy" ? 10 : difficulty === "medium" ? 5 : 3;
    currentHighscore.Times += 1;
    console.log(chalk.whiteBright("\nYou chose " +
        chalk.underline.bold(difficulty === "easy"
            ? chalk.gray("Easy (10 attempts)")
            : difficulty === "medium"
                ? chalk.yellowBright("Medium (5 attempts)")
                : chalk.redBright("Hard (3 attempts)")) +
        "\n"));
    gameEvents.removeAllListeners("Guesses");
    gameEvents.on("Guesses", function () {
        if (guessAttempts >= maxAttempts) {
            clearInterval(timerHandler);
            return gameEvents.emit("Lose", timer, correctAnswer);
        }
        inputInterface.question(chalk.whiteBright(guessAttempts + 1 !== maxAttempts
            ? "Guess ".concat(guessAttempts + 1, ": ")
            : chalk.bold("Final Guess: ")), function (guess) {
            var parsedGuess = parseInt(guess);
            if (Number.isNaN(parsedGuess)) {
                console.log(chalk.redBright("Invalid number, try again."));
                return gameEvents.emit("Guesses");
            }
            if (parsedGuess > correctAnswer) {
                console.log(parsedGuess - correctAnswer <= 20
                    ? chalk.yellowBright("Close! Try a bit smaller.")
                    : chalk.redBright("Too high."));
            }
            else if (parsedGuess < correctAnswer) {
                console.log(correctAnswer - parsedGuess <= 20
                    ? chalk.yellowBright("Close! Try a bit bigger.")
                    : chalk.redBright("Too low."));
            }
            else {
                clearInterval(timerHandler);
                return gameEvents.emit("Correct", timer, correctAnswer, difficulty);
            }
            guessAttempts++;
            gameEvents.emit("Guesses");
        });
    });
    gameEvents.emit("Guesses");
});
gameEvents.on("Correct", function (time, answer, difficulty) {
    currentHighscore.Highscore +=
        difficulty == "easy" ? 1 : difficulty == "medium" ? 2 : 3;
    retry("win", time, answer);
});
gameEvents.on("Lose", function (time, answer) {
    retry("lose", time, answer);
});
gameEvents.emit("Begin");
gameEvents.emit("Highscore Storage");
