import * as http from "http";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "node:path";

type units =
  | "Celcius"
  | "Farenheit"
  | "Kelvin"
  | "Metre"
  | "Centimetre"
  | "Millimetre"
  | "Feet"
  | "Yard"
  | "Kg"
  | "Lb";
type ConversionData = {
  unit: string;
  from: units;
  to: units;
};

dotenv.config({
  path: `${__dirname + "/.env"}`,
});

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
};

const port = process.env.PORT,
  Server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      let filePath = "";

      if (request.url !== "/convert") {
        let content, contentType, extName;
        if (request.url === "/")
          filePath = path.join(__dirname, "WebPage", "index.html");
        else filePath = path.join(__dirname, decodeURI(request.url!));

        extName = path.extname(filePath).toLowerCase();
        contentType = mimeTypes[extName] || "application/octet-stream";

        content = await fs.readFile(filePath, { encoding: "utf-8" });

        response.writeHead(200, {
          "content-type": contentType,
        });
        response.end(content);
      } else {
        let formData: any = "",
          result: number = 0,
          converted: boolean = true;

        request.on("data", (data: Buffer) => {
          formData += data.toString();
        });

        request.on("end", () => {
          let convertData: ConversionData = JSON.parse(formData);
          result = Number.parseInt(convertData.unit);

          switch (convertData.from) {
            case "Celcius":
              if (convertData.to == "Farenheit") result = result * (9 / 5) + 32;
              else if (convertData.to == "Celcius") result = result;
              else if (convertData.to == "Kelvin") result += 273;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Farenheit":
              if (convertData.to == "Farenheit") result = result;
              else if (convertData.to == "Celcius")
                result = (result - 32) * (5 / 9);
              else if (convertData.to == "Kelvin")
                result = (result - 32) * (5 / 9) + 273;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Kelvin":
              if (convertData.to == "Celcius") result -= 273;
              else if (convertData.to == "Farenheit")
                result = (result - 273) * (9 / 5) + 32;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Kg":
              if (convertData.to == "Lb") result *= 2.205;
              else if (convertData.to == "Kg") result = result;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Lb":
              if (convertData.to == "Kg") result /= 2.205;
              else if (convertData.to == "Lb") result = result;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Metre":
              if (convertData.to == "Feet") result *= 3.281;
              else if (convertData.to == "Metre") result = result;
              else if (convertData.to == "Centimetre") result *= 100;
              else if (convertData.to == "Millimetre") result *= 1000;
              else if (convertData.to == "Yard") result *= 1.094;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Centimetre":
              if (convertData.to == "Feet") result = (result / 100) * 3.281;
              else if (convertData.to == "Metre") result /= 100;
              else if (convertData.to == "Centimetre") result = result;
              else if (convertData.to == "Millimetre") result *= 10;
              else if (convertData.to == "Yard")
                result = (result / 100) * 1.094;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Millimetre":
              if (convertData.to == "Feet") result = (result / 1000) * 3.281;
              else if (convertData.to == "Metre") result = result / 1000;
              else if (convertData.to == "Centimetre") result /= 10;
              else if (convertData.to == "Millimetre") result = result;
              else if (convertData.to == "Yard")
                result = (result / 1000) * 1.094;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Feet":
              if (convertData.to == "Feet") result = result;
              else if (convertData.to == "Metre") result = result / 3.281;
              else if (convertData.to == "Millimetre")
                result = (result / 3.281) * 1000;
              else if (convertData.to == "Centimetre")
                result = (result / 3.281) * 100;
              else if (convertData.to == "Yard") result /= 3;
              else {
                result = 0;
                converted = false;
              }
              break;
            case "Yard":
              if (convertData.to == "Feet") result *= 3;
              else if (convertData.to == "Metre") result /= 1.094;
              else if (convertData.to == "Centimetre") result *= 91.44;
              else if (convertData.to == "Millimetre") result *= 914.4;
              else {
                result = 0;
                converted = false;
              }
          }

          response.writeHead(200);
          return response.end(
            JSON.stringify({
              Initial: convertData.unit,
              InitialUnit: convertData.from,
              Result: Number.parseInt(result.toPrecision(3)),
              Converted: converted,
              Unit: convertData.to,
            })
          );
        });
      }
    }
  );

Server.listen(port, () => {
  process.stdout.write(`Server is up and running at ${port}`);
});

//Serving up web page files involves loading all of them together and passing each of them to the response
