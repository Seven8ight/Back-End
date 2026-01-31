import * as fs from "fs/promises";
import * as path from "path";

type CacheResponse = {
  Headers: Record<string, any>;
  Response: Record<string, any>;
};
type CacheItem = {
  url: string;
  Result: CacheResponse;
};
type Cache = {
  Cache: CacheItem[];
};

interface CacheInterface {
  cacheFileExistence(): Promise<boolean>;
  createCacheFile(): Promise<void>;
  cacheResponse(url: string, headers: any, Response: any): Promise<boolean>;
  retrieveResponse(url: string): Promise<CacheItem | null>;
  clearCache(): Promise<boolean>;
}

export class CacheDB implements CacheInterface {
  async cacheFileExistence(): Promise<boolean> {
    try {
      await fs.readFile(path.join(__dirname, "Cache.json"), {
        encoding: "utf-8",
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async createCacheFile(): Promise<void> {
    const fileContent: Record<string, any> = {
      Cache: [],
    };

    await fs.writeFile(
      path.join(__dirname, "Cache.json"),
      JSON.stringify(fileContent),
      {
        encoding: "utf-8",
        flag: "w",
      },
    );
  }

  async cacheResponse(
    url: string,
    headers: any,
    Response: any,
  ): Promise<boolean> {
    if (url.length > 0 && Response != null)
      try {
        if ((await this.cacheFileExistence()) == false)
          await this.createCacheFile();

        const contents = await fs.readFile(path.join(__dirname, "Cache.json"), {
            encoding: "utf-8",
          }),
          contentsParsed: Cache = JSON.parse(contents);

        contentsParsed.Cache.push({
          url: url,
          Result: {
            Headers: headers,
            Response: Response,
          },
        });

        await fs.writeFile(
          path.join(__dirname, "Cache.json"),
          JSON.stringify(contentsParsed),
          {
            encoding: "utf-8",
          },
        );

        return true;
      } catch (error) {
        if (error instanceof Error)
          if (error.message.includes("not exist")) await this.createCacheFile();

        return false;
      }
    else {
      process.stdout.write(
        "Error in caching, url may be null or response is null",
      );
      return false;
    }
  }

  async retrieveResponse(url: string): Promise<CacheItem | null> {
    if (url.length > 0)
      try {
        if ((await this.cacheFileExistence()) == false) {
          await this.createCacheFile();
          return null;
        }

        const contents = await fs.readFile(path.join(__dirname, "Cache.json"), {
            encoding: "utf-8",
          }),
          cache: Cache = JSON.parse(contents);

        if (cache.Cache) {
          const cacheFind = cache.Cache.find((cache) => cache.url == url);

          if (cacheFind) return cacheFind;

          return null;
        } else return null;
      } catch (error) {
        if (error instanceof Error)
          if (error.message.includes("not exist")) await this.createCacheFile();
          else process.stdout.write(`${error.message}`);

        return null;
      }
    else {
      process.stdout.write("URL length is invalid");
      return null;
    }
  }

  async clearCache(): Promise<boolean> {
    try {
      await fs.writeFile(
        path.join(__dirname, "Cache.json"),
        JSON.stringify({
          Cache: [],
        }),
        { encoding: "utf-8" },
      );

      return true;
    } catch (error) {
      if (error instanceof Error)
        process.stdout.write(`Error: ${error.message}`);

      return false;
    }
  }
}
