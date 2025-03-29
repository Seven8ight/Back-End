#!usr/env/node
import { ClientRequest, IncomingMessage } from "http";
import * as https from "https";
import * as chalk from "chalk";

type Data = {
  id: string;
  type: string;
  actor: {};
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    commits: [];
  };
  public: boolean;
  created_at: string;
};

if (process.argv.length <= 2) {
  console.log(`
        Invalid username passed in,
        To place in a command add the flag github='username'
    `);
  process.exit(1);
} else {
  const username = process.argv[2].split("=")[1];

  if (username != null || username != undefined) {
    let requestCallback = async (response: IncomingMessage): Promise<void> => {
        try {
          let responseData: string = "";

          if (response.statusCode != 200) {
            response.resume();
            throw `Request failed, expected status code of 200, instead got ${response.statusCode}`;
          }

          response.on("data", async (data: Buffer) => {
            if (data) responseData += data.toString();
          });
          response.on("error", (error) => {
            process.stdout.write(error.message);
          });
          response.on("end", () => {
            let userData: Data[] = JSON.parse(responseData);

            if (userData.length == 0)
              console.log("No user of such username exists");
            else {
              userData.forEach((Data) => {
                switch (Data.type) {
                  case "PullRequestEvent":
                    console.log(
                      ` - ${chalk.underline(username)} made a ${chalk.blue(
                        "pull request"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "PushEvent":
                    console.log(
                      ` - ${chalk.underline(
                        username
                      )} made ${chalk.redBright.underline(
                        Data.payload.commits.length,
                        Data.payload.commits.length > 1 ? "commits" : "commit"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "CreateEvent":
                    console.log(
                      ` - ${chalk.underline(
                        username
                      )} made a ${chalk.underline.greenBright(
                        "fork"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "IssueCommentEvent":
                    console.log(
                      ` - ${chalk.underline(
                        username
                      )} posted an ${chalk.magentaBright(
                        "issue"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "IssuesEvent":
                    console.log(
                      ` - ${chalk.underline(
                        username
                      )} posted some ${chalk.magentaBright(
                        "issues"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "PullRequestReviewEvent":
                    console.log(
                      ` - ${chalk.underline(
                        username
                      )} began ${chalk.magentaBright(
                        "reviewing"
                      )} ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "ForkEvent":
                    console.log(
                      ` - ${username} created a ${chalk.cyanBright(
                        "fork"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  case "WatchEvent":
                    console.log(
                      ` - ${username} started ${chalk.blueBright(
                        "watching"
                      )} on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                    break;
                  default:
                    console.log(
                      ` - ${chalk.underline(username)} made a ${
                        Data.type
                      } on ${chalk.underline.whiteBright(Data.repo.name)}`
                    );
                }
              });
            }
          });
        } catch (error) {
          console.log(error);
        }
      },
      githubRequest: ClientRequest = https.get(
        `https://api.github.com/users/${username}/events?per_page=5`,
        {
          headers: {
            accept: "application/json",
            "user-agent": `node.js`,
          },
        },
        requestCallback
      );

    githubRequest.on("error", (error) => {
      if (error.message.includes("ENOTFOUND")) {
        console.log(
          chalk.redBright.underline("No internet Connection") + ",",
          "please reconnect to fetch data."
        );
      } else {
        console.log(
          "An error occured during the request, pleaase try again later" +
            "\n" +
            error.message
        );
      }
    });
    githubRequest.end();
  } else
    console.log(
      "Invalid argument passed in, ensure the flag, github is used as e.g. github=<username>"
    );
}
