import * as dotenv from "dotenv";
import * as path from "path";
import { URL } from "url";

dotenv.config({ path: path.join(__dirname, ".env") });

import * as http from "http";
import * as fs from "fs";
import * as fsPr from "fs/promises";
import formidable from "formidable";
import SpellChecker from "simple-spellchecker";

const server: http.Server = http.createServer(
  async (
    request: http.IncomingMessage,
    response: http.ServerResponse<http.IncomingMessage>
  ) => {
    const url = new URL(request.url!, `http://${request.headers.host}`),
      params = url.pathname.split("/").filter(Boolean);

    response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, PATCH, OPTIONS"
    );
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-type, authorization, accept"
    );

    if (request.method == "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    switch (params[0]) {
      case "grammar":
        if (request.method == "POST") {
          let fileContents: any = "";

          request.on(
            "data",
            (data: Buffer) => (fileContents += data.toString())
          );

          request.on("end", () => {
            const parsedFileContent = JSON.parse(fileContents),
              text = parsedFileContent.fileContent,
              words = text.split(" "),
              misspelledWords: Record<string, string[]>[] = [];

            SpellChecker.getDictionary(
              "en-US",
              (error: Error | null, dictionary: any) => {
                if (error || !dictionary) {
                  response.writeHead(500, {
                    "content-type": "application/json",
                  });
                  response.end(
                    JSON.stringify({ error: "Failed to load dictionary" })
                  );
                  return;
                }

                for (const word of words) {
                  const cleanWord = word.replace(/[^a-zA-Z0-9\s]/g, "").trim();
                  if (!cleanWord) continue;

                  const isMisspelled = !dictionary.spellCheck(cleanWord);

                  if (isMisspelled) {
                    const suggestions = dictionary.getSuggestions(cleanWord);
                    misspelledWords.push({ [cleanWord]: suggestions });
                  }
                }

                const filtered = misspelledWords.filter((word) =>
                  Object.values(word).some(
                    (value) => Array.isArray(value) && value.length > 0
                  )
                );

                response.writeHead(200, { "content-type": "application/json" });
                response.end(JSON.stringify(filtered));
              }
            );
          });
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              Error: "Try using a POST method instead",
            })
          );
        }
        break;
      case "save":
        if (request.method == "POST") {
          try {
            const form = formidable({}),
              [_, files] = await form.parse(request);

            const uploadedFile = files.file;

            if (!uploadedFile) throw new Error("No file uploaded");

            if (uploadedFile[0].mimetype?.toLowerCase() == "text/markdown") {
              try {
                if (fs.existsSync(path.join(process.cwd(), "Uploads")) == false)
                  await fsPr.mkdir(path.join(process.cwd(), "Uploads"), {
                    recursive: true,
                  });

                const results = await fsPr.readdir(
                    path.join(process.cwd(), "Uploads"),
                    {
                      encoding: "utf-8",
                    }
                  ),
                  fileCheck = results.find(
                    (file) => file == uploadedFile[0].originalFilename
                  );

                const tempPath = uploadedFile.at(0)?.filepath;

                if (!fileCheck) {
                  const newPath = path.join(
                    process.cwd(),
                    "Uploads",
                    uploadedFile.at(0)?.originalFilename || "uploaded_file"
                  );

                  await fsPr.rename(tempPath as string, newPath);
                } else {
                  const newPath = path.join(
                    process.cwd(),
                    "Uploads",
                    `${
                      uploadedFile[0].originalFilename!.split(".")[0] +
                      `_${results.length + 1}.` +
                      uploadedFile[0].originalFilename!.split(".")[1]
                    }`
                  );

                  await fsPr.rename(tempPath as string, newPath);
                }

                response.writeHead(200, { "content-type": "application/json" });
                response.end(
                  JSON.stringify({
                    Message: "Received file successfully",
                  })
                );
              } catch (error) {
                response.writeHead(500);
                response.end(
                  JSON.stringify({
                    Error: `${(error as Error).message}`,
                  })
                );
              }
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error:
                    "Invalid file format, ensure to pass in only markdowns",
                })
              );
              return;
            }
          } catch (error) {
            response.writeHead(500, { "content-type": "application/json" });
            response.end(
              JSON.stringify({
                Error: `${(error as Error).message}`,
              })
            );
          }
        } else {
          response.writeHead(405, { "content-type": "application/json" });
          response.end(
            JSON.stringify({
              Error: "Incorrect routing method used, try POST instead",
            })
          );
        }

        break;
      case "get":
        try {
          if (fs.existsSync(path.join(process.cwd(), "Uploads"))) {
            const folderPath = path.join(process.cwd(), "Uploads"),
              files = await fsPr.readdir(folderPath, {
                encoding: "utf-8",
              });

            const fileResults = await Promise.all(
              files.map(async (file: string) => {
                const filePath = `${folderPath}/${file}`,
                  fileContents: string = await fsPr.readFile(filePath, {
                    encoding: "utf-8",
                  });
                return { file, fileContents };
              })
            );

            response.writeHead(200, { "content-type": "application/json" });
            response.end(JSON.stringify(fileResults, null, 2));
          }
        } catch (error) {
          response.writeHead(500);
          response.end(
            JSON.stringify({
              Error: `${(error as Error).message}`,
            })
          );
        }
        break;
      case "delete":
        const fileName = params[1];

        if (fileName) {
          try {
            if (fs.existsSync(path.join(process.cwd(), "Uploads")) == false) {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: " No files uploaded",
                })
              );
              return;
            }

            await fsPr.rm(path.join(process.cwd(), "Uploads", fileName));

            response.writeHead(204);
            response.end(
              JSON.stringify({
                Message: "Deleted successfully",
              })
            );
          } catch (error) {
            if ((error as Error).message.toLowerCase().includes("not exist")) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  Error: "File does not exist",
                })
              );
              return;
            }

            response.writeHead(500);
            response.end(
              JSON.stringify({
                Error: (error as Error).message,
              })
            );
          }
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              Error: "Filename not present",
            })
          );
          return;
        }

        break;
      default:
        response.writeHead(200);
        response.end(
          JSON.stringify({
            Message: "Index route for markdown.",
          })
        );
        break;
    }
  }
);

server.listen(process.env.PORT, () =>
  process.stdout.write(`Server is listening at port: ${process.env.PORT}`)
);
