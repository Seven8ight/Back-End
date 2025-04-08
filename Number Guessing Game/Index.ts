#!usr/bin/env node
import { EventEmitter } from "node:events";
import { createInterface, Interface } from "node:readline";
import * as fs from "fs/promises";
import * as chalk from "chalk";

type Difficulty = null | "easy" | "medium" | "hard";
type HighScore = {
  Round: number;
  Status: "win" | "lose";
  RepeatTimes: number;
  Highscore: number;
};

let guessAttempts = 0;
let timer = 0;
let timerHandler: NodeJS.Timeout;
let correctAnswer: number;
let currentDifficulty: Difficulty = null;

const generateAnswer = (): number => Math.floor(Math.random() * 100) + 1;

const gameEvents: EventEmitter = new EventEmitter();
const inputInterface: Interface = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const retry = (status: "win" | "lose", time: number, answer: number): void => {
  if (status == "win") {
    console.log(
      chalk.greenBright(`\nCorrect! It took you ${time}s to figure it out.\n`)
    );
  } else {
    console.log(
      chalk.redBright("\nYou lose. ") +
        chalk.gray(`The correct answer was ${answer}\n`)
    );
  }

  clearInterval(timerHandler);
  timer = 0;

  inputInterface.question("Want to try again (y/n): ", (response: string) => {
    if (response.toLowerCase().includes("y")) {
      guessAttempts = 0;
      gameEvents.emit("Begin");
    } else {
      console.log(chalk.whiteBright.underline("\nThank you for playing!\n"));
      process.exit(0);
    }
  });
};

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
      chalk.redBright("3. Hard (3 attempts)\n\n")
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

  console.log(
    chalk.whiteBright(
      "\nYou chose " +
        chalk.underline.bold(
          difficulty === "easy"
            ? chalk.gray("Easy (10 attempts)")
            : difficulty === "medium"
            ? chalk.yellowBright("Medium (5 attempts)")
            : chalk.redBright("Hard (3 attempts)")
        ) +
        "\n"
    )
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
          : chalk.bold("Final Guess: ")
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
              : chalk.redBright("Too high.")
          );
        } else if (parsedGuess < correctAnswer) {
          console.log(
            correctAnswer - parsedGuess <= 20
              ? chalk.yellowBright("Close! Try a bit bigger.")
              : chalk.redBright("Too low.")
          );
        } else {
          clearInterval(timerHandler);
          return gameEvents.emit("Correct", timer, correctAnswer, difficulty);
        }

        guessAttempts++;
        gameEvents.emit("Guesses");
      }
    );
  });

  gameEvents.emit("Guesses");
});

gameEvents.on(
  "Correct",
  (time: number, answer: number, difficulty: Difficulty) => {
    retry("win", time, answer);
  }
);

gameEvents.on("Lose", (time: number, answer: number) => {
  retry("lose", time, answer);
});

gameEvents.emit("Begin");
