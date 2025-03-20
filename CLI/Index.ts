#!usr/bin/env node
import { createInterface, Interface } from "node:readline";
import { EventEmitter } from "node:events";
import * as winston from "winston";
import * as fs from "fs/promises";
import * as chalk from "chalk";

type taskFile = {
  tasks: task[];
};
type userFile = {
  details: {
    id: number;
    name: string;
  };
};
type task = {
  id: number | string;
  task: string;
  Completed: boolean;
};
type person = {
  id: string;
  name: string;
};

let user: Partial<person> = {};

const taskChecker = (task: Partial<task>): task is task => {
  return (
    task.id != undefined &&
    task.task != undefined &&
    task.Completed != undefined
  );
};

const commands: Interface = createInterface({
    input: process.stdin,
    output: process.stdout,
  }),
  events: EventEmitter = new EventEmitter(),
  { combine, json, errors } = winston.format,
  Logger = winston.createLogger({
    level: "info",
    transports: [new winston.transports.Console()],
    format: combine(json(), errors({ stack: true })),
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
  });

const createTaskStorage = async (): Promise<boolean> => {
    let fileCreated: boolean = false;

    await fs
      .readFile("./Tasks.json", {
        encoding: "utf-8",
      })
      .then(() => (fileCreated = !fileCreated))
      .catch(async (error: Error) => {
        if (error.message.includes("ENOENT")) {
          await fs.writeFile(
            "Tasks.json",
            JSON.stringify({
              tasks: [],
            })
          );
        }
      });

    return fileCreated;
  },
  createUserStorage = async (): Promise<boolean> => {
    let userFileAbsence: boolean = false;
    await fs
      .readFile("./Details.json", {
        encoding: "utf-8",
      })
      .then((file) => {
        user.name = (JSON.parse(file) as userFile).details.name;
      })
      .catch(async (error: Error) => {
        if (error.message.includes("ENOENT")) {
          await fs
            .writeFile(
              "Details.json",
              JSON.stringify({
                details: [],
              })
            )
            .then(() => (userFileAbsence = !userFileAbsence));
        }
      });
    return userFileAbsence;
  },
  postTask = async (task: task) => {
    try {
      let file = JSON.parse(
          JSON.stringify(
            (await fs.readFile(__dirname + "/Tasks.json")).toString()
          )
        ),
        currentTasks: taskFile = JSON.parse(file);

      currentTasks.tasks.push(task);

      await fs
        .writeFile(__dirname + "/Tasks.json", JSON.stringify(currentTasks))
        .then(() => console.log(chalk.blue("Added")));
    } catch (error) {
      console.log(error);
    } finally {
      events.emit("Program Continuation");
    }
  },
  listTasks = async () => {
    try {
      await fs
        .readFile("Tasks.json", {
          encoding: "utf-8",
        })
        .then((file) => {
          let tasks: taskFile = JSON.parse(file);
          if (tasks.tasks.length > 0) {
            console.log("---------" + chalk.underline("Tasks") + "---------\n");
            tasks.tasks.forEach((task) => {
              console.log(
                task.id + ".",
                chalk.underline(chalk.italic.whiteBright(task.task)),
                "-",
                task.Completed
                  ? chalk.green("Complete")
                  : chalk.red("Incomplete")
              );
            });

            let summary: number = tasks.tasks.filter(
              (tasks) => tasks.Completed == false
            ).length;
            console.log(
              "\n",
              summary > 0
                ? chalk.gray(
                    `${summary} task` +
                      `${summary > 1 ? "s" : ""}` +
                      " remaining"
                  )
                : chalk.green("All tasks completed")
            );
            console.log("\n-----------------------");
          } else console.log(chalk.italic.underline("No tasks added"));
        });
    } catch (error) {
      console.log(error);
    } finally {
      events.emit("Program Continuation");
    }
  },
  updateTask = async (taskId: number) => {
    try {
      let file = JSON.parse(
          JSON.stringify(
            (await fs.readFile(__dirname + "/Tasks.json")).toString()
          )
        ),
        currentTasks: taskFile = JSON.parse(file);
      if (taskId > currentTasks.tasks.length || taskId < 0)
        console.log(chalk.red.underline.bold("\nNo such task ID exists\n"));
      else {
        let isComplete: boolean = false;

        const updatedTasks = currentTasks.tasks.map((task) => {
          if (task.id == taskId) {
            task.Completed = !task.Completed;
            if (task.Completed == true) isComplete = true;
          }
          return task;
        });

        await fs
          .writeFile(
            __dirname + "/Tasks.json",
            JSON.stringify({
              tasks: updatedTasks,
            })
          )
          .then(() =>
            console.log(
              chalk.underline(
                isComplete
                  ? chalk.blue("Updated task", taskId)
                  : chalk.red("Updated task", taskId)
              )
            )
          );
      }
    } catch (error) {
      console.log(error);
    } finally {
      events.emit("Program Continuation");
    }
  },
  deleteTask = async (taskId: number) => {
    try {
      let file = JSON.parse(
          JSON.stringify(
            (await fs.readFile(__dirname + "/Tasks.json")).toString()
          )
        ),
        currentTasks: taskFile = JSON.parse(file);
      if (taskId > currentTasks.tasks.length || taskId < 0)
        console.log(chalk.red.underline.bold("\nNo such task ID exists\n"));
      else {
        const filteredTasks = currentTasks.tasks
          .filter((task) => task.id != taskId)
          .map((task, index) => {
            task.id = index + 1;
            return task;
          });

        await fs
          .writeFile(
            __dirname + "/Tasks.json",
            JSON.stringify({
              tasks: filteredTasks,
            })
          )
          .then(() =>
            console.log(chalk.green("\nDeleted task ", taskId + "\n"))
          );
      }
    } catch (error) {
      console.log("Error in deletion, try again", error);
    } finally {
      events.emit("Program Continuation");
    }
  },
  changeUsername = async (username: string) => {
    try {
      let userDetails: userFile = await fs
        .readFile("Details.json", {
          encoding: "utf-8",
        })
        .then((file) => JSON.parse(file));

      userDetails.details.name = username;

      await fs
        .writeFile("Details.json", JSON.stringify(userDetails))
        .then(() =>
          console.log(chalk.green("Username " + chalk.underline("changed")))
        );
    } catch (error) {
      console.log(error);
    } finally {
      events.emit("Program Continuation");
    }
  },
  checkFiles = async (): Promise<boolean> => {
    let taskFileExistence = await createTaskStorage(),
      userFileExistence = await createUserStorage(),
      checker: boolean = false;

    if (!taskFileExistence) console.log("Task file created");
    if (userFileExistence == true) {
      console.log("User file created");
      events.emit("Ask name");
    }
    checker = true;
    return checker;
  };

events.once("start", async () => {
  const programFiles = await checkFiles();

  if (programFiles == true) {
    console.log("\nHello", user.name + ". What will be of todays tasks\n");
    events.emit("Program Continuation");
  }
});

events.on("Ask name", () => {
  commands.question("What is your name:", async (name: string) => {
    if (name.length > 0) {
      fs.writeFile(
        "Details.json",
        JSON.stringify({
          details: {
            id: Date.now(),
            name: name,
          },
        })
      )
        .then(() =>
          console.log("Hello", name + ". What will be of today's tasks")
        )
        .catch(() => {
          console.log("Error in creating user, please try again");
          process.abort();
        });
      events.emit("Program Continuation");
    } else {
      console.log("Please enter your name");
      events.emit("Ask name");
    }
  });
});
events.on("Add task", async () => {
  let task: Partial<task> = {},
    currentTasks: taskFile = JSON.parse(
      JSON.stringify(
        await fs
          .readFile("Tasks.json", {
            encoding: "utf-8",
          })
          .then((tasks) => JSON.parse(tasks))
      )
    );

  commands.question("Enter task Name: ", async (taskName: string) => {
    task.id = currentTasks.tasks.length + 1;
    task.task = taskName;
    task.Completed = false;

    const checker = taskChecker(task);

    checker && postTask(task);
  });
});
events.on("List Tasks", async () => await listTasks());
events.on("Delete task", async (id: number) => await deleteTask(id));
events.on("Update task", async (id: number) => await updateTask(id));
events.on("Change username", async (username) => changeUsername(username));
events.on("Program Continuation", () =>
  commands.question("> (enter 'help' for commands): ", (command: string) => {
    let formattedCommand = command.toLowerCase();

    if (formattedCommand.includes("help")) {
      process.stdout.write(`
        Commands:
          help -> lists all commands
          add task -> adds new tasks
          list -> view current tasks
          update -> updates a task in accordance to its id i.e. update 1
          delete -> deletes a task in accordance to its id i.e. delete 1
          change username -> changes your name i.e. change username <new name here>
          quit -> Exit from the Application
      `);
      events.emit("Program Continuation");
    } else if (formattedCommand.includes("add")) events.emit("Add task");
    else if (formattedCommand == "list") events.emit("List Tasks");
    else if (formattedCommand.includes("update")) {
      const taskId = Number.parseInt(command.split(" ")[1]);

      if (Number.isNaN(taskId) == true)
        process.stdout.write(
          "Invalid task id passed in, ensure please enter a number"
        );
      else events.emit("Update task", taskId);
    } else if (formattedCommand.includes("delete")) {
      const taskId = Number.parseInt(command.split(" ")[1]);

      if (Number.isNaN(taskId) == true)
        process.stdout.write(
          "Invalid task id passed in, ensure please enter a number"
        );
      else events.emit("Delete task", taskId);
      events.emit("Program Continuation");
    } else if (formattedCommand == "quit") process.exit(0);
    else if (
      formattedCommand == "change username" ||
      formattedCommand.includes("change")
    ) {
      let newUsername = formattedCommand.split(" ")[2];
      events.emit("Change username", newUsername);
    } else {
      console.log(
        chalk.red(
          "Invalid command. Type in 'help' to view the accessible commands"
        )
      );
      events.emit("Program Continuation");
    }
  })
);

events.emit("start");

process.on("exit", () => {
  process.stdout.write("Exiting application\n");
});
process.on("uncaughtException", (error) => {
  Logger.error("Error", error);
});
