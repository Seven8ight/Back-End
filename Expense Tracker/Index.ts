#!/usr/bin/env node
import { EventEmitter } from "node:events";
import * as fs from "fs/promises";
import * as path from "path";
import * as chalk from "chalk";

type Expense = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  month?: number | string;
};
type Expenses = {
  Expenses: Expense[];
  Budget: number;
};

enum Months {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

const expenseEvents = new EventEmitter(),
  commands = process.argv.slice(2).map((command) => command.replace("--", ""));

const writeToFile = async (content: any): Promise<boolean | Error> => {
    try {
      await fs.writeFile("./Expenses.json", content, {
        encoding: "utf-8",
      });
      return true;
    } catch (error) {
      return error as Error;
    }
  },
  readExpenses = async (): Promise<Expenses | Error> => {
    try {
      let expenseContent = await fs.readFile("./Expenses.json", {
        encoding: "utf-8",
      });

      return JSON.parse(expenseContent);
    } catch (error: any) {
      return error as Error;
    }
  };

expenseEvents.once("Generate File", async () => {
  try {
    await fs.readFile("./Expenses.json");
  } catch (error: any) {
    if (error.code == "ENOENT") {
      process.stdout.write(
        chalk.magentaBright("\nStorage file doesn't exist, creating file\n"),
      );
      await fs.writeFile(
        "Expenses.json",
        JSON.stringify({
          Expenses: [],
          Budget: 0,
        }),
      );
    }
  }
});
expenseEvents.on("list", async (type: any = "all") => {
  let expenses = await readExpenses();

  if (expenses instanceof Error == false) {
    if (expenses.Expenses.length > 0) {
      if (typeof type == "string") {
        if (type.toLowerCase() == "all") {
          process.stdout.write(
            `\n${chalk.whiteBright.underline("Expenses")}\n\n`,
          );
          expenses.Expenses.forEach((expense) => {
            process.stdout.write(
              `${chalk.gray(expense.id)}. ${chalk.whiteBright(
                expense.description,
              )} - ${chalk.green(
                `$${expense.amount.toLocaleString("en-Us", {
                  currency: "USD",
                })}`,
              )}
          ` +
                `${chalk.whiteBright(
                  `Month - ${chalk.underline(expense.month)}`,
                )}
          ${chalk.whiteBright(
            `Category - ${chalk.underline(expense.category)}`,
          )}\n`,
            );
          });
        } else if (type.toLowerCase() == "summary") {
          process.stdout.write(
            `${chalk.blueBright("Summary")} ${chalk.green.underline(
              "$" +
                expenses.Expenses.reduce(
                  (accumulator, current) => (accumulator += current.amount),
                  0,
                ),
            )}\n`,
          );
        }
      } else {
        if (Array.isArray(type)) {
          let argumentsPassed = type[1].split("=");

          switch (argumentsPassed[0].toLowerCase()) {
            case "category":
              process.stdout.write(
                `${chalk.underline.whiteBright(
                  `Expenses for ${argumentsPassed[1]}\n\n`,
                )}`,
              );
              expenses.Expenses.forEach((expense) => {
                if (expense.category == argumentsPassed[1]) {
                  process.stdout.write(
                    `${chalk.gray(expense.id)}. ${chalk.whiteBright(
                      expense.description,
                    )} - ${chalk.green(
                      "$" +
                        expense.amount.toLocaleString("en-US", {
                          currency: "USD",
                        }),
                    )}\n`,
                  );
                }
              });
              break;
            case "month":
              let Month =
                Object.entries(Months)[
                  Object.entries(Months).findIndex(
                    (month) =>
                      month[0] == argumentsPassed[1] ||
                      month[1] == argumentsPassed[1],
                  )
                ];

              process.stdout.write(
                chalk.whiteBright.underline(
                  `Expenses for month, ${argumentsPassed[1]}\n\n`,
                ),
              );
              expenses.Expenses.forEach((expense) => {
                if (expense.month == Month[0] || expense.month == Month[1]) {
                  process.stdout.write(
                    `${chalk.gray(expense.id)}. ${chalk.whiteBright(
                      expense.description,
                    )} - ${chalk.green(
                      "$" +
                        expense.amount.toLocaleString("en-US", {
                          currency: "USD",
                        }),
                    )}\n`,
                  );
                }
              });
              break;
            default:
              process.stdout.write(
                chalk.redBright(
                  "Pass in either the month or category e.g. month=4 category=apple",
                ),
              );
              break;
          }
        }
      }
      let currentPrices = expenses.Expenses.reduce(
        (accum, current) => (accum += current.amount),
        0,
      );

      if (currentPrices > expenses.Budget)
        process.stdout.write(
          chalk.blueBright("\nBudget ") +
            chalk.redBright.underline(
              "$" +
                expenses.Budget.toLocaleString("en-US", { currency: "USD" }) +
                " exceeded\n",
            ),
        );
      else
        process.stdout.write(
          chalk.blueBright("\nBudget ") +
            chalk.green.underline(
              "$" +
                expenses.Budget.toLocaleString("en-US", { currency: "USD" }) +
                "\n",
            ),
        );
    } else
      process.stdout.write(chalk.blackBright.underline("No expenses added\n"));
  } else {
    if (expenses.message == "Unexpected end of JSON input")
      process.stdout.write(chalk.blackBright.underline("No expenses added\n"));
    else if (expenses.message.includes("no such file or directory")) {
      process.stdout.write(
        chalk.magentaBright.underline(
          "Expenses storage file does not exist, currenty being created\n",
        ),
      );
    } else {
      process.stdout.write(expenses.message + "\n");
      process.stdout.write(expenses.name);
    }
  }
});
expenseEvents.on(
  "add",
  async ({ description, amount, category, month }: Omit<Expense, "id">) => {
    if (description && amount) {
      let expenses = await readExpenses();

      if (expenses instanceof Error == false) {
        let expenseId = expenses.Expenses.length + 1;

        expenses.Expenses.push({
          id: expenseId,
          description: description,
          amount: Number.parseInt(amount as any),
          category: category ? category : "Default",
          month: month ? month : new Date().getMonth() + 1,
        });

        let changes = await writeToFile(
          JSON.stringify({
            Expenses: expenses.Expenses,
            Budget: expenses.Budget,
          }),
        );
        if (changes)
          process.stdout.write(chalk.green(`Expense added, ${expenseId}`));
        else
          process.stdout.write(
            chalk.redBright(
              chalk.underline("Error"),
              "Writing to file failed please try again",
            ),
          );
      } else {
        process.stdout.write(
          chalk.redBright("File does not exist, creating file"),
        );
        process.stdout.write(expenses.message);
      }
    } else {
      process.stdout.write(
        chalk.red(
          "Ensure to pass in a description and amount flag when adding, additionals being month and category",
        ),
      );
    }
  },
);
expenseEvents.on(
  "update",
  async ({ id, description, category, amount, month }: Expense) => {
    if (id) {
      let currentExpenses = await readExpenses();

      if (currentExpenses instanceof Error == false) {
        if (!description && !category && !amount && !month) {
          process.stdout.write(
            chalk.redBright("Provide the necessary arguments for updating"),
          );
        } else {
          let expenseExists = currentExpenses.Expenses.findIndex(
            (expense) => expense.id == id,
          );

          if (expenseExists != -1) {
            if (amount && Number.isNaN(Number.parseInt(amount as any)))
              process.stdout.write(
                chalk.redBright(
                  "Invalid amount passed in, pass in numbers for amount",
                ),
              );
            else {
              let updatedExpenses = currentExpenses.Expenses.map((expense) => {
                if (expense.id == id)
                  return {
                    id: id,
                    description: description
                      ? description
                      : expense.description,
                    category: category ? category : expense.category,
                    amount: amount
                      ? Number.parseInt(amount as any)
                      : expense.amount,
                    month: month ? month : expense.month,
                  };
                return expense;
              });

              let update = await writeToFile(
                JSON.stringify({
                  Expenses: updatedExpenses,
                  Budget: currentExpenses.Budget,
                }),
              );
              if (update)
                process.stdout.write(
                  chalk.green("Updated" + ` ${id} ` + "successfully"),
                );
              else process.stdout.write("Error");
            }
          } else
            process.stdout.write(
              chalk.redBright("Expense of id, " + id + " does not exist"),
            );
        }
      } else
        process.stdout.write(chalk.redBright.underline("Error:")) +
          chalk.redBright("Unable to read file, please try again");
    } else
      process.stdout.write(
        chalk.red(
          chalk.underline("Error:") +
            "Ensure to provide the expense id and valid arguments to update i.e. id=1 desc=something amount=35",
        ),
      );
  },
);
expenseEvents.on("set", async (budget: number) => {
  let expenses = await readExpenses();

  if (expenses instanceof Error == false) {
    expenses.Budget = budget;

    let budgetSet = await writeToFile(JSON.stringify(expenses));

    if (budgetSet) process.stdout.write(chalk.green("Budget set to " + budget));
    else
      process.stdout.write(chalk.redBright("Error occured please try again"));
  } else
    process.stdout.write(
      chalk.magentaBright("File does not exist, creating now."),
    );
});
expenseEvents.on("change", async (budget: number) => {
  let expenses = await readExpenses();

  if (expenses instanceof Error == false) {
    expenses.Budget = budget;

    let budgetUpdate = await writeToFile(JSON.stringify(expenses));

    if (budgetUpdate)
      process.stdout.write(chalk.green("Budget updated to " + budget));
    else
      process.stdout.write(chalk.redBright("Error occured please try again"));
  } else
    process.stdout.write(
      chalk.magentaBright("File does not exist, creating now."),
    );
});
expenseEvents.on("delete", async (id: number) => {
  if (id) {
    const expenses = await readExpenses();

    if (expenses instanceof Error) {
      process.stdout.write(
        chalk.redBright("Error: Expenses file does not exist"),
      );
    } else {
      const exists = expenses.Expenses.findIndex((expense) => expense.id == id);

      if (exists != -1) {
        const filteredExpenses = expenses.Expenses.filter(
            (expense) => expense.id != id,
          ).map((expense, index) => {
            return { ...expense, id: index + 1 };
          }),
          updateExpenses = await writeToFile(
            JSON.stringify({
              Expenses: filteredExpenses,
              Budget: expenses.Budget,
            }),
          );

        if (updateExpenses) process.stdout.write(chalk.blue("Deleted " + id));
        else process.stdout.write("Error in ");
      } else
        process.stdout.write(
          chalk.redBright(
            "Error: " + "Expense of id " + id + " does not exist\n",
          ),
        );
    }
  } else
    process.stdout.write(
      chalk.red("Pass in the id of the expense to complete the operation"),
    );
});
expenseEvents.on("export", async () => {
  let expenses = await readExpenses();

  if (expenses instanceof Error == false) {
    await fs.writeFile(
      path.join(__dirname, "Expenses.csv"),
      `Id,Description,Category,Month,Amount\n`,
    );

    for (let index = 0; index < expenses.Expenses.length; index++) {
      let currentExpense = expenses.Expenses[index];
      await fs.appendFile(
        path.join(__dirname, "Expenses.csv"),
        `${currentExpense.id},${currentExpense.description},${currentExpense.category},${currentExpense.month},${currentExpense.amount}\n`,
      );
    }

    await fs.writeFile(
      path.join(__dirname, "Expenses.csv"),
      `\nBudget\n$${expenses.Budget}\n`,
      { flag: "a" },
    );

    process.stdout.write(chalk.green.underline("Exported successfully"));
  } else
    process.stdout.write(
      "\n" + chalk.red(chalk.underline("Error") + "File does not exist"),
    );
});

expenseEvents.emit("Generate File");

if (commands[0]) {
  switch (commands[0].toLowerCase()) {
    case "add":
      if (commands[1]) {
        let fields: Record<string, any> = {};
        for (let index = 1; index <= commands.slice(1).length; index++) {
          for (let [key, value] of [commands[index].split("=")]) {
            if (key.includes("desc")) fields["description"] = value;
            else fields[key] = value;
          }
        }
        expenseEvents.emit("add", { ...fields });
      } else
        process.stdout.write(
          chalk.red(
            "Provide extra arguments i.e. description, amount, category and month to continue(category and month can be nullible",
          ),
        );
      break;
    case "list":
      expenseEvents.emit("list");
      break;
    case "summary":
      if (commands.length > 1) {
        expenseEvents.emit("list", [...commands]);
      } else expenseEvents.emit("list", "summary");
      break;
    case "update":
      if (commands[1]) {
        let updateFields: Record<string, any> = {};

        for (let index = 1; index <= commands.slice(1).length; index++) {
          for (let [key, value] of [commands[index].split("=")]) {
            if (key.includes("desc")) updateFields["description"] = value;
            else updateFields[key] = value;
          }
        }

        expenseEvents.emit("update", { ...updateFields });
      } else
        process.stdout.write(
          chalk.red(
            "Provide extra arguments for update e.g. id(compulsory), description or amount or category or month",
          ),
        );
      break;
    case "delete":
      expenseEvents.emit("delete", Number.parseInt(commands[1]));
      break;
    case "budget":
      let budget = Number.parseInt(commands[1].split("=")[1]);

      if (!Number.isNaN(budget)) {
        if (commands[1].includes("set"))
          expenseEvents.emit("set", Number.parseInt(commands[1].split("=")[1]));
        else if (commands[1].includes("update"))
          expenseEvents.emit(
            "change",
            Number.parseInt(commands[1].split("=")[1]),
          );
        else
          process.stdout.write(
            chalk.cyan(
              "Budget commands are either set or update e.g. Budget update=100",
            ),
          );
      } else
        process.stdout.write(chalk.redBright("Ensure to pass in a number"));

      break;
    case "export":
      expenseEvents.emit("export");
      break;
    default:
      process.stdout.write(
        chalk.red(
          "Pass in an argument to continue i.e. add --description=<text> --amount=<number>",
        ),
      );
      break;
  }
} else {
  process.stdout.write(
    chalk.whiteBright(
      chalk.underline(
        "\nWelcome to NodeJS Expense Tracker command line application.\n",
      ) +
        "Pass in the following extra arguments to continue, each is distinct use them one at a time i.e. add,list,update and delete\n\n",
    ),
  );
}
