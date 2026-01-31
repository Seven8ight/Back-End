#!/usr/bin/env node
import { EventEmitter } from "node:events";
import { createInterface, Interface } from "node:readline";
import * as fs from "fs/promises";
import * as path from "path";
import * as chalk from "chalk";

type Difficulty = null | "easy" | "medium" | "hard";
type HighScore = {
  Round: number;
  Times: number;
  Highscore: number;
};

let guessAttempts = 0,
  timer = 0,
  timerHandler: NodeJS.Timeout,
  correctAnswer: number,
  currentDifficulty: Difficulty = null,
  currentHighscore: Partial<HighScore> = {
    Highscore: 0,
    Times: 0,
  };

const generateAnswer = (): number => Math.floor(Math.random() * 100) + 1,
  gameEvents: EventEmitter = new EventEmitter(),
  inputInterface: Interface = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const retry = async (
    status: "win" | "lose",
    time: number,
    answer: number,
  ): Promise<void> => {
    try {
      if (status == "win") {
        console.log(
          chalk.greenBright(
            `\nCorrect! It took you ${time}s to figure it out.\n`,
          ),
        );
      } else {
        console.log(
          chalk.redBright("\nYou lose. ") +
            chalk.gray(`The correct answer was ${answer}\n`),
        );
      }

      clearInterval(timerHandler);
      timer = 0;

      inputInterface.question(
        "Want to try again (y/n): ",
        async (response: string) => {
          if (response.toLowerCase().includes("y")) {
            guessAttempts = 0;
            gameEvents.emit("Begin");
          } else {
            console.log(
              chalk.whiteBright.underline("\nThank you for playing!\n"),
            );
            highscoreWrite().then(() => process.exit(0));
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  },
  highscoreWrite = async () => {
    let highscores: { Highscores: HighScore[] } = JSON.parse(
      await fs.readFile(path.join(__dirname, "Highscores.json"), {
        encoding: "utf-8",
      }),
    );

    currentHighscore.Round = highscores.Highscores.length + 1;
    highscores.Highscores.push(currentHighscore as HighScore);
    highscores.Highscores.sort(
      (previous, current) => current.Highscore - previous.Highscore,
    );

    await fs.writeFile(
      path.join(__dirname, "Highscores.json"),
      JSON.stringify({
        ...highscores,
      }),
    );
  };

gameEvents.once("Highscore Storage", async () => {
  try {
    await fs.writeFile(
      "./Highscores.json",
      JSON.stringify({
        Highscores: [],
      }),
      {
        flag: "wx",
      },
    );
  } catch (error: any) {
    if (error.code == "EEXIST") {
      return;
    }
    console.log(chalk.redBright("Error in creating file, try again"));
    console.log(error);
    return;
  }
});

gameEvents.on("Begin", () => {
  console.clear();
  guessAttempts = 0;
  currentDifficulty = null;
  correctAnswer = generateAnswer();

  console.log(
    chalk.whiteBright.bold.underline("\nNumber-guessing game\n\n") +
      chalk.whiteBright("I'm thinking of a number between 1 and 100\n") +
      chalk.whiteBright("Select a difficulty level:\n\n") +
      chalk.gray("1. Easy (10 attempts)\n") +
      chalk.yellowBright("2. Medium (5 attempts)\n") +
      chalk.redBright("3. Hard (3 attempts)\n\n"),
  );

  gameEvents.removeAllListeners("Ask");
  gameEvents.on("Ask", () => {
    inputInterface.question("Enter difficulty (1,2 or 3): ", (answer: any) => {
      const choice = parseInt(answer);
      if (![1, 2, 3].includes(choice)) {
        console.log(chalk.redBright("Invalid input, please enter 1, 2, or 3."));
        gameEvents.emit("Ask");
      } else {
        currentDifficulty =
          choice === 1 ? "easy" : choice === 2 ? "medium" : "hard";
        timerHandler = setInterval(() => (timer += 1), 1000);
        gameEvents.emit("Attempts", currentDifficulty);
      }
    });
  });

  gameEvents.emit("Ask");
});

gameEvents.on("Attempts", (difficulty: Difficulty) => {
  const maxAttempts =
    difficulty === "easy" ? 10 : difficulty === "medium" ? 5 : 3;
  (currentHighscore.Times as number) += 1;

  console.log(
    chalk.whiteBright(
      "\nYou chose " +
        chalk.underline.bold(
          difficulty === "easy"
            ? chalk.gray("Easy (10 attempts)")
            : difficulty === "medium"
              ? chalk.yellowBright("Medium (5 attempts)")
              : chalk.redBright("Hard (3 attempts)"),
        ) +
        "\n",
    ),
  );

  gameEvents.removeAllListeners("Guesses");
  gameEvents.on("Guesses", () => {
    if (guessAttempts >= maxAttempts) {
      clearInterval(timerHandler);
      return gameEvents.emit("Lose", timer, correctAnswer);
    }

    inputInterface.question(
      chalk.whiteBright(
        guessAttempts + 1 !== maxAttempts
          ? `Guess ${guessAttempts + 1}: `
          : chalk.bold("Final Guess: "),
      ),
      (guess: any) => {
        const parsedGuess = parseInt(guess);
        if (Number.isNaN(parsedGuess)) {
          console.log(chalk.redBright("Invalid number, try again."));
          return gameEvents.emit("Guesses");
        }

        if (parsedGuess > correctAnswer) {
          console.log(
            parsedGuess - correctAnswer <= 20
              ? chalk.yellowBright("Close! Try a bit smaller.")
              : chalk.redBright("Too high."),
          );
        } else if (parsedGuess < correctAnswer) {
          console.log(
            correctAnswer - parsedGuess <= 20
              ? chalk.yellowBright("Close! Try a bit bigger.")
              : chalk.redBright("Too low."),
          );
        } else {
          clearInterval(timerHandler);
          return gameEvents.emit("Correct", timer, correctAnswer, difficulty);
        }

        guessAttempts++;
        gameEvents.emit("Guesses");
      },
    );
  });

  gameEvents.emit("Guesses");
});

gameEvents.on(
  "Correct",
  (time: number, answer: number, difficulty: Difficulty) => {
    (currentHighscore.Highscore as number) +=
      difficulty == "easy" ? 1 : difficulty == "medium" ? 2 : 3;
    retry("win", time, answer);
  },
);

gameEvents.on("Lose", (time: number, answer: number) => {
  retry("lose", time, answer);
});

gameEvents.emit("Begin");
gameEvents.emit("Highscore Storage");
