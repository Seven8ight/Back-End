import chalk from "chalk";

const date = new Date();

export const Info = (message: string) =>
    process.stdout.write(
      `${chalk.blueBright.underline("Info")}[${date.toString()}]: ${chalk.whiteBright(message)}\n`,
    ),
  Warning = (message: string) =>
    process.stdout.write(
      `${chalk.yellowBright("Warning")}[${date.toString()}]: ${chalk.whiteBright(message)}\n`,
    ),
  Error = (message: string) =>
    process.stdout.write(
      `${chalk.redBright("Error")}[${date.toString()}]: ${chalk.whiteBright(message)}\n`,
    ),
  Message = (username: string, message: string) =>
    process.stdout.write(
      `${chalk.green.underline(username)}: ${chalk.whiteBright(message)}\n`,
    );
