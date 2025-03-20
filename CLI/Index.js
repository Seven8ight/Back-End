#!usr/bin/env node
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
var node_readline_1 = require("node:readline");
var node_events_1 = require("node:events");
var winston = require("winston");
var fs = require("fs/promises");
var chalk = require("chalk");
var user = {};
var taskChecker = function (task) {
    return (task.id != undefined &&
        task.task != undefined &&
        task.Completed != undefined);
};
var commands = (0, node_readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout,
}), events = new node_events_1.EventEmitter(), _a = winston.format, combine = _a.combine, json = _a.json, errors = _a.errors, Logger = winston.createLogger({
    level: "info",
    transports: [new winston.transports.Console()],
    format: combine(json(), errors({ stack: true })),
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});
var createTaskStorage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fileCreated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileCreated = false;
                return [4 /*yield*/, fs
                        .readFile("./Tasks.json", {
                        encoding: "utf-8",
                    })
                        .then(function () { return (fileCreated = !fileCreated); })
                        .catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!error.message.includes("ENOENT")) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fs.writeFile("Tasks.json", JSON.stringify({
                                            tasks: [],
                                        }))];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/, fileCreated];
        }
    });
}); }, createUserStorage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var userFileAbsence;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userFileAbsence = false;
                return [4 /*yield*/, fs
                        .readFile("./Details.json", {
                        encoding: "utf-8",
                    })
                        .then(function (file) {
                        user.name = JSON.parse(file).details.name;
                    })
                        .catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!error.message.includes("ENOENT")) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fs
                                            .writeFile("Details.json", JSON.stringify({
                                            details: [],
                                        }))
                                            .then(function () { return (userFileAbsence = !userFileAbsence); })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/, userFileAbsence];
        }
    });
}); }, postTask = function (task) { return __awaiter(void 0, void 0, void 0, function () {
    var file, currentTasks, _a, _b, _c, _d, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, 4, 5]);
                _b = (_a = JSON).parse;
                _d = (_c = JSON).stringify;
                return [4 /*yield*/, fs.readFile(__dirname + "/Tasks.json")];
            case 1:
                file = _b.apply(_a, [_d.apply(_c, [(_e.sent()).toString()])]), currentTasks = JSON.parse(file);
                currentTasks.tasks.push(task);
                return [4 /*yield*/, fs
                        .writeFile(__dirname + "/Tasks.json", JSON.stringify(currentTasks))
                        .then(function () { return console.log(chalk.blue("Added")); })];
            case 2:
                _e.sent();
                return [3 /*break*/, 5];
            case 3:
                error_1 = _e.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 4:
                events.emit("Program Continuation");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); }, listTasks = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, fs
                        .readFile("Tasks.json", {
                        encoding: "utf-8",
                    })
                        .then(function (file) {
                        var tasks = JSON.parse(file);
                        if (tasks.tasks.length > 0) {
                            console.log("---------" + chalk.underline("Tasks") + "---------\n");
                            tasks.tasks.forEach(function (task) {
                                console.log(task.id + ".", chalk.underline(chalk.italic.whiteBright(task.task)), "-", task.Completed
                                    ? chalk.green("Complete")
                                    : chalk.red("Incomplete"));
                            });
                            var summary = tasks.tasks.filter(function (tasks) { return tasks.Completed == false; }).length;
                            console.log("\n", summary > 0
                                ? chalk.gray("".concat(summary, " task") +
                                    "".concat(summary > 1 ? "s" : "") +
                                    " remaining")
                                : chalk.green("All tasks completed"));
                            console.log("\n-----------------------");
                        }
                        else
                            console.log(chalk.italic.underline("No tasks added"));
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [3 /*break*/, 4];
            case 3:
                events.emit("Program Continuation");
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); }, updateTask = function (taskId) { return __awaiter(void 0, void 0, void 0, function () {
    var file, currentTasks, _a, _b, _c, _d, isComplete_1, updatedTasks, error_3;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 5, 6, 7]);
                _b = (_a = JSON).parse;
                _d = (_c = JSON).stringify;
                return [4 /*yield*/, fs.readFile(__dirname + "/Tasks.json")];
            case 1:
                file = _b.apply(_a, [_d.apply(_c, [(_e.sent()).toString()])]), currentTasks = JSON.parse(file);
                if (!(taskId > currentTasks.tasks.length || taskId < 0)) return [3 /*break*/, 2];
                console.log(chalk.red.underline.bold("\nNo such task ID exists\n"));
                return [3 /*break*/, 4];
            case 2:
                isComplete_1 = false;
                updatedTasks = currentTasks.tasks.map(function (task) {
                    if (task.id == taskId) {
                        task.Completed = !task.Completed;
                        if (task.Completed == true)
                            isComplete_1 = true;
                    }
                    return task;
                });
                return [4 /*yield*/, fs
                        .writeFile(__dirname + "/Tasks.json", JSON.stringify({
                        tasks: updatedTasks,
                    }))
                        .then(function () {
                        return console.log(chalk.underline(isComplete_1
                            ? chalk.blue("Updated task", taskId)
                            : chalk.red("Updated task", taskId)));
                    })];
            case 3:
                _e.sent();
                _e.label = 4;
            case 4: return [3 /*break*/, 7];
            case 5:
                error_3 = _e.sent();
                console.log(error_3);
                return [3 /*break*/, 7];
            case 6:
                events.emit("Program Continuation");
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }, deleteTask = function (taskId) { return __awaiter(void 0, void 0, void 0, function () {
    var file, currentTasks, _a, _b, _c, _d, filteredTasks, error_4;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 5, 6, 7]);
                _b = (_a = JSON).parse;
                _d = (_c = JSON).stringify;
                return [4 /*yield*/, fs.readFile(__dirname + "/Tasks.json")];
            case 1:
                file = _b.apply(_a, [_d.apply(_c, [(_e.sent()).toString()])]), currentTasks = JSON.parse(file);
                if (!(taskId > currentTasks.tasks.length || taskId < 0)) return [3 /*break*/, 2];
                console.log(chalk.red.underline.bold("\nNo such task ID exists\n"));
                return [3 /*break*/, 4];
            case 2:
                filteredTasks = currentTasks.tasks
                    .filter(function (task) { return task.id != taskId; })
                    .map(function (task, index) {
                    task.id = index + 1;
                    return task;
                });
                return [4 /*yield*/, fs
                        .writeFile(__dirname + "/Tasks.json", JSON.stringify({
                        tasks: filteredTasks,
                    }))
                        .then(function () {
                        return console.log(chalk.green("\nDeleted task ", taskId + "\n"));
                    })];
            case 3:
                _e.sent();
                _e.label = 4;
            case 4: return [3 /*break*/, 7];
            case 5:
                error_4 = _e.sent();
                console.log("Error in deletion, try again", error_4);
                return [3 /*break*/, 7];
            case 6:
                events.emit("Program Continuation");
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); }, changeUsername = function (username) { return __awaiter(void 0, void 0, void 0, function () {
    var userDetails, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, 4, 5]);
                return [4 /*yield*/, fs
                        .readFile("Details.json", {
                        encoding: "utf-8",
                    })
                        .then(function (file) { return JSON.parse(file); })];
            case 1:
                userDetails = _a.sent();
                userDetails.details.name = username;
                return [4 /*yield*/, fs
                        .writeFile("Details.json", JSON.stringify(userDetails))
                        .then(function () {
                        return console.log(chalk.green("Username " + chalk.underline("changed")));
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                error_5 = _a.sent();
                console.log(error_5);
                return [3 /*break*/, 5];
            case 4:
                events.emit("Program Continuation");
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); }, checkFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var taskFileExistence, userFileExistence, checker;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createTaskStorage()];
            case 1:
                taskFileExistence = _a.sent();
                return [4 /*yield*/, createUserStorage()];
            case 2:
                userFileExistence = _a.sent(), checker = false;
                if (!taskFileExistence)
                    console.log("Task file created");
                if (userFileExistence == true) {
                    console.log("User file created");
                    events.emit("Ask name");
                }
                checker = true;
                return [2 /*return*/, checker];
        }
    });
}); };
events.once("start", function () { return __awaiter(void 0, void 0, void 0, function () {
    var programFiles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkFiles()];
            case 1:
                programFiles = _a.sent();
                if (programFiles == true) {
                    console.log("\nHello", user.name + ". What will be of todays tasks\n");
                    events.emit("Program Continuation");
                }
                return [2 /*return*/];
        }
    });
}); });
events.on("Ask name", function () {
    commands.question("What is your name:", function (name) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (name.length > 0) {
                fs.writeFile("Details.json", JSON.stringify({
                    details: {
                        id: Date.now(),
                        name: name,
                    },
                }))
                    .then(function () {
                    return console.log("Hello", name + ". What will be of today's tasks");
                })
                    .catch(function () {
                    console.log("Error in creating user, please try again");
                    process.abort();
                });
                events.emit("Program Continuation");
            }
            else {
                console.log("Please enter your name");
                events.emit("Ask name");
            }
            return [2 /*return*/];
        });
    }); });
});
events.on("Add task", function () { return __awaiter(void 0, void 0, void 0, function () {
    var task, currentTasks, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                task = {};
                _b = (_a = JSON).parse;
                _d = (_c = JSON).stringify;
                return [4 /*yield*/, fs
                        .readFile("Tasks.json", {
                        encoding: "utf-8",
                    })
                        .then(function (tasks) { return JSON.parse(tasks); })];
            case 1:
                currentTasks = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                commands.question("Enter task Name: ", function (taskName) { return __awaiter(void 0, void 0, void 0, function () {
                    var checker;
                    return __generator(this, function (_a) {
                        task.id = currentTasks.tasks.length + 1;
                        task.task = taskName;
                        task.Completed = false;
                        checker = taskChecker(task);
                        checker && postTask(task);
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
events.on("List Tasks", function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, listTasks()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
events.on("Delete task", function (id) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, deleteTask(id)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
events.on("Update task", function (id) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, updateTask(id)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
events.on("Change username", function (username) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, changeUsername(username)];
}); }); });
events.on("Program Continuation", function () {
    return commands.question("> (enter 'help' for commands): ", function (command) {
        var formattedCommand = command.toLowerCase();
        if (formattedCommand.includes("help")) {
            process.stdout.write("\n        Commands:\n          help -> lists all commands\n          add task -> adds new tasks\n          list -> view current tasks\n          update -> updates a task in accordance to its id i.e. update 1\n          delete -> deletes a task in accordance to its id i.e. delete 1\n          change username -> changes your name i.e. change username <new name here>\n          quit -> Exit from the Application\n      ");
            events.emit("Program Continuation");
        }
        else if (formattedCommand.includes("add"))
            events.emit("Add task");
        else if (formattedCommand == "list")
            events.emit("List Tasks");
        else if (formattedCommand.includes("update")) {
            var taskId = Number.parseInt(command.split(" ")[1]);
            if (Number.isNaN(taskId) == true)
                process.stdout.write("Invalid task id passed in, ensure please enter a number");
            else
                events.emit("Update task", taskId);
        }
        else if (formattedCommand.includes("delete")) {
            var taskId = Number.parseInt(command.split(" ")[1]);
            if (Number.isNaN(taskId) == true)
                process.stdout.write("Invalid task id passed in, ensure please enter a number");
            else
                events.emit("Delete task", taskId);
            events.emit("Program Continuation");
        }
        else if (formattedCommand == "quit")
            process.exit(0);
        else if (formattedCommand == "change username" ||
            formattedCommand.includes("change")) {
            var newUsername = formattedCommand.split(" ")[2];
            events.emit("Change username", newUsername);
        }
        else {
            console.log(chalk.red("Invalid command. Type in 'help' to view the accessible commands"));
            events.emit("Program Continuation");
        }
    });
});
events.emit("start");
process.on("exit", function () {
    process.stdout.write("Exiting application\n");
});
process.on("uncaughtException", function (error) {
    Logger.error("Error", error);
});
