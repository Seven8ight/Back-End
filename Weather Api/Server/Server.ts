import * as http from "http";
import * as https from "https";
import * as dotenv from "dotenv";
import * as redis from "redis";
import path from "path";
import fs from "fs/promises";
import url from "url";

class DB {
  resolvedAddress: string;
  humidity: number;
  temp: number;
  precip: number;
  pressure: number;
  conditions: string;
  visibility: number;

  constructor({
    resolvedAddress,
    humidity,
    temp,
    precip,
    pressure,
    conditions,
    visibility,
  }) {
    this.resolvedAddress = resolvedAddress;
    this.humidity = humidity;
    this.temp = temp;
    this.precip = precip;
    this.pressure = pressure;
    this.conditions = conditions;
    this.visibility = visibility;
  }

  async cache(): Promise<number> {
    let storage = await redisClient.hSet(this.resolvedAddress, {
      temp: this.temp,
      humidity: this.humidity,
      precip: this.precip,
      conditions: this.conditions,
      visibility: this.visibility,
      pressure: this.pressure,
      resolvedAddress: this.resolvedAddress,
    });
    redisClient.expire(this.resolvedAddress, 3600);

    return storage;
  }
}

type WeatherInfo = {
  resolvedAddress: string;
  humidity: number;
  temp: number;
  precip: number;
  pressure: number;
  conditions: string;
  visibility: number;
};

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const portNumber = process.env.PORT,
  visualApiKey = process.env.VISUAL_CROSSING,
  mimetypes = {
    html: "text/html",
    css: "text/css",
    js: "application/js",
    png: "image/png",
  },
  redisClient = redis.createClient(),
  weatherPageRenderer = async (file: string): Promise<any> =>
    await fs.readFile(path.resolve(__dirname, "../", "Client", file), {
      encoding: "utf-8",
    }),
  imageRenderer = async (file: string): Promise<any> =>
    await fs.readFile(path.resolve(__dirname, "../", "Client", file)),
  server: http.Server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      let Url = url.parse(request.url as string),
        urlPath = Url.pathname as string,
        parsedResource =
          Url.pathname == "/" ? "html" : path.extname(urlPath).substring(1),
        mimeType = mimetypes[parsedResource] || "application/octet-stream",
        file = path.join(
          path.resolve(__dirname, "../Client"),
          urlPath == "/" ? "/index.html" : urlPath
        ),
        redisKeys = await redisClient.keys("*");

      switch (urlPath) {
        case "/weather":
          let place: any = "";

          request.on("data", (data: Buffer) => {
            place += data.toString();
          });
          request.on("end", async () => {
            let Place: { Place: string } = JSON.parse(place);

            if (Place) {
              let weatherData: any = "",
                weatherReturnInfo: WeatherInfo,
                cached: Boolean = false,
                location: string = "";

              redisKeys.forEach((key) => {
                if (key.toLowerCase().includes(Place.Place.toLowerCase())) {
                  cached = true;
                  location = key;
                }
              });

              const date = new Date(),
                currentDate = `${date.getFullYear()}-${
                  date.getMonth() + 1
                }-${date.getDate()}`;

              if (!cached) {
                const weatherRequest: http.ClientRequest = https.request(
                  `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${Place.Place}/${currentDate}?key=${visualApiKey}`,
                  {
                    method: "GET",
                    headers: {
                      "content-type": "application/json",
                      accept: "application/json",
                    },
                  },
                  (serverResponse: http.IncomingMessage) => {
                    serverResponse.on("data", (data: Buffer) => {
                      weatherData += data.toString();
                    });

                    serverResponse.on("close", async () => {
                      try {
                        weatherData = JSON.parse(weatherData);
                        weatherReturnInfo = {
                          resolvedAddress: `${Place.Place},${
                            weatherData.resolvedAddress.split(",")[
                              weatherData.resolvedAddress.split(",").length - 1
                            ]
                          }`,
                          humidity: weatherData.days[0].humidity,
                          visibility: weatherData.days[0].visibility,
                          precip: Number(weatherData.days[0].precip),
                          pressure: weatherData.days[0].pressure,
                          temp: weatherData.days[0].temp,
                          conditions: weatherData.days[0].conditions,
                        };

                        const Database = new DB({
                          ...weatherReturnInfo,
                        });
                        await Database.cache();

                        response.writeHead(200);
                        response.end(JSON.stringify(weatherReturnInfo));
                        return;
                      } catch (error) {
                        switch (serverResponse.statusCode) {
                          case 400:
                            response.writeHead(404);
                            response.end(
                              JSON.stringify({
                                message: "City / state not found",
                              })
                            );
                            break;
                          default:
                            response.writeHead(500);
                            response.end(
                              JSON.stringify({
                                message: "Server error",
                              })
                            );
                        }
                      }
                    });

                    serverResponse.on("error", (error: Error) => {
                      response.writeHead(500);
                      response.end(
                        JSON.stringify({
                          message: "Error caught in server",
                          serverError: error.message,
                        })
                      );
                      return;
                    });
                  }
                );

                weatherRequest.on("error", (error: Error) => {
                  response.writeHead(500);
                  response.end(
                    JSON.stringify({
                      Error: error.message,
                    })
                  );
                  return;
                });
                weatherRequest.end();
              } else {
                let weatherInfo = await redisClient.hGetAll(location);

                response.writeHead(200);
                response.end(JSON.stringify(weatherInfo));
              }
            } else {
              response.writeHead(404, "No body parsed in");
              response.end(
                JSON.stringify({
                  Message: "No body parsed",
                })
              );
            }
          });
          break;
        default:
          response.writeHead(200, {
            "content-type": mimeType,
          });
          response.end(
            path.extname(urlPath).substring(1) == "png"
              ? await imageRenderer(file)
              : await weatherPageRenderer(file)
          );
          break;
      }
    }
  );

redisClient.on("error", (error: Error) => {
  console.log("Redis Client error");
  console.log(error.message);
});

server.listen(portNumber, async () => {
  await redisClient.connect();

  console.log(
    redisClient.isReady
      ? "Redis client up and running, server is running at port " + portNumber
      : "Redis client down, server is up and running at port " + portNumber
  );
});

process.on("uncaughtException", (error: Error) => {
  console.log(error.name);
  console.log(error.message);
  console.log(error.stack);
  server.close();
});
