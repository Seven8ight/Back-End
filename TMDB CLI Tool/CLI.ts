#!/usr/bin/env node

import * as https from "https";
import { EventEmitter } from "stream";
import * as chalk from "chalk";
import * as path from "path";
import * as dotenv from "dotenv";
import { ClientRequest, IncomingMessage } from "http";

dotenv.config({ path: path.join(__dirname, ".env") });

enum MovieType {
  PLAYING,
  POPULAR,
  TOP,
  UPCOMING,
  UNDEFINED,
}

type Movie = {
  adult: boolean;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  title: string;
};
type Response = {
  dates?: Record<string, string>;
  page: number;
  results: Movie[];
};

const Events = new EventEmitter();

let movieUrl: string | undefined,
  options: Record<string, string | Record<string, string>> = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
    },
  };

Events.on("Retrieve movie type", (movieType: MovieType) => {
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

Events.on("Display movie list", (List: Response, movieType: MovieType) => {
  let movieTypeString: string = "";

  if (movieType == MovieType.PLAYING) movieTypeString = "Currently Playing";
  else if (movieType == MovieType.POPULAR) movieTypeString = "Popular";
  else if (movieType == MovieType.TOP) movieTypeString = "Top movies";
  else if (movieType == MovieType.UPCOMING) movieTypeString = "Upcoming movies";
  else movieTypeString = "Undefined movie category";

  let maxDate: Date, minDate: Date;

  if (movieType != MovieType.POPULAR && movieType != MovieType.TOP) {
    if (List.dates) {
      maxDate = new Date(List.dates.maximum);
      minDate = new Date(List.dates.minimum);

      process.stdout.write(
        `\n${chalk.underline.green.bold(movieTypeString)}  `
      );

      process.stdout.write(
        `  Between ${chalk.green(
          `${minDate.getDate()}-${
            minDate.getMonth() + 1
          }-${minDate.getFullYear()}`
        )} and ${chalk.green(
          `${maxDate.getDate()}-${
            maxDate.getMonth() + 1
          }-${maxDate.getFullYear()}`
        )}\n\n`
      );
    }
  } else
    process.stdout.write(
      `\n${chalk.underline.green.bold(movieTypeString)}\n\n`
    );

  List.results.forEach((movie) => {
    process.stdout.write(
      `${chalk.grey("Title")} - ${chalk.whiteBright.underline(
        `${movie.title}`
      )}\n`
    );
    process.stdout.write(
      `${chalk.grey("Original Title")} - ${chalk.whiteBright.underline(
        `${movie.title}`
      )}\n`
    );
    process.stdout.write(
      `${chalk.grey("Original Languages")} - ${chalk.whiteBright.underline(
        `${movie.original_language}`
      )}\n`
    );
    process.stdout.write(
      `${chalk.white("Adult")} - ${chalk.whiteBright.underline(
        `${movie.adult ? "Yes" : "No"}\n`
      )}`
    );
    process.stdout.write(
      `\n ${chalk.cyan("Overview")} - ${chalk.whiteBright(
        `${movie.overview}`
      )}\n\n`
    );
    process.stdout.write(
      `${chalk.grey("Voter count")} - ${chalk.whiteBright(
        `${movie.vote_count}\n`
      )}`
    );
    process.stdout.write(
      `${chalk.grey("Rating")} - ${
        movie.vote_average >= 7
          ? chalk.greenBright.underline(`${movie.vote_average}`)
          : movie.vote_average >= 5
          ? chalk.yellowBright.underline(`${movie.vote_average}`)
          : movie.vote_average == 0 && movie.vote_count <= 0
          ? chalk.redBright.underline("Not rated")
          : chalk.redBright.underline(`${movie.vote_average}`)
      }\n`
    );

    process.stdout.write(
      `------------------------------------------------------------------------------\n\n`
    );
  });
});

Events.on("Fetch movie list", async (url: string) => {
  if (url != undefined) {
    try {
      const fetchMovie: ClientRequest = https.get(
        url,
        options,
        (response: IncomingMessage) => {
          let movieList: string = "";

          response.on("data", (data: any) => {
            movieList += data;
          });
          response.on("end", () => {
            let movieType: MovieType;

            if (url.includes("top")) movieType = MovieType.TOP;
            else if (url.includes("now")) movieType = MovieType.PLAYING;
            else if (url.includes("popular")) movieType = MovieType.POPULAR;
            else if (url.includes("upcoming")) movieType = MovieType.UPCOMING;
            else movieType = MovieType.UNDEFINED;

            Events.emit("Display movie list", JSON.parse(movieList), movieType);
          });
        }
      );

      fetchMovie.on("finish", () => {
        process.stdout.write("Finished fetching\n");
      });

      fetchMovie.on("error", (error: Error) => {
        process.stdout.write(
          `${chalk.redBright.underline("Error:")} - ${chalk.red.underline(
            `${error.message}`
          )}\n`
        );
      });

      fetchMovie.end();
    } catch (error) {
      process.stdout.write(
        `${chalk.redBright.underline("Error")} - ${chalk.red.underline(
          `${(error as Error).message}`
        )}\n`
      );
    }
  } else
    process.stdout.write(
      `${chalk.redBright.underline("Error")} - ${chalk.whiteBright.underline(
        "Invalid movie category put in, try either popular, top, upcoming or playing"
      )}\n`
    );
});

let args = process.argv.slice(2),
  flag = /^--type$/g.test(args[0]),
  movieType: string = "";

if (flag) movieType = args[1];

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

process.on("uncaughtException", (error: Error) =>
  process.stdout.write(
    `${chalk.redBright.underline("Error:")} - ${chalk.red.underline(
      `${error.message}`
    )}\n`
  )
);

process.on("unhandledRejection", (error: Error) =>
  process.stdout.write(
    `${chalk.redBright.underline("Error:")} - ${chalk.red.underline(
      `${error.message}`
    )}\n`
  )
);
