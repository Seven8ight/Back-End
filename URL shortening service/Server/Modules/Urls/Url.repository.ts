import type { Client, QueryResult } from "pg";
import type { shortURL, shortURLRepo, updateShortURLDTO } from "./Url.types.js";
import type { redisClient } from "../../Config/Config.js";

export class UrlRepository implements shortURLRepo {
  constructor(
    private pgClient: Client,
    private cacheClient: typeof redisClient,
  ) {}

  private async cacheResponse(shortCode: string, shortUrlBody: shortURL) {
    await this.cacheClient.hSet(shortCode, shortUrlBody);
  }

  private async getCacheResponse(shortCode: string) {
    return await this.cacheClient.hGetAll(shortCode);
  }

  private async clearCacheItem(shortCode: string) {
    await this.cacheClient.del(shortCode);
  }

  async createShortURL(longURL: string): Promise<shortURL> {
    try {
      const shortUrlCode = longURL.slice(0, Math.random() * longURL.length + 3);

      const newShortUrl: QueryResult<shortURL> = await this.pgClient.query(
        "INSERT INTO urls(url,shortCode) VALUES($1,$2)",
        [longURL, shortUrlCode],
      );

      if (newShortUrl.rowCount && newShortUrl.rowCount > 0) {
        await this.cacheResponse(shortUrlCode, newShortUrl.rows[0]!);

        return newShortUrl.rows[0]!;
      }

      throw new Error("Error in creating short URL!");
    } catch (error) {
      throw error;
    }
  }

  async updateShortURL(
    shortCode: string,
    newUpdateDetails: updateShortURLDTO,
  ): Promise<shortURL> {
    try {
      const updateOperation = await this.pgClient.query(
        "UPDATE urls SET url=$1 WHERE shortCode=$2 RETURNING *",
        [shortCode, newUpdateDetails.url],
      );

      if (updateOperation.rowCount && updateOperation.rowCount > 0) {
        const checkInCache = await this.getCacheResponse(shortCode);

        if (!checkInCache) {
          await this.clearCacheItem(shortCode);

          await this.cacheResponse(shortCode, updateOperation.rows[0]);
        } else await this.cacheResponse(shortCode, updateOperation.rows[0]);
      }

      throw new Error("Update failed, try again; Database error");
    } catch (error) {
      throw error;
    }
  }

  async getOriginalURL(shortCode: string): Promise<shortURL> {
    try {
      const cachedOriginalUrl = await this.getCacheResponse(shortCode);

      if (cachedOriginalUrl) return cachedOriginalUrl as unknown as shortURL;
      else {
        const originalUrl: QueryResult<shortURL> = await this.pgClient.query(
          "SELECT * FROM urls FROM shortCode=$1",
          [shortCode],
        );

        if (originalUrl.rowCount && originalUrl.rowCount > 0) {
          await this.updateShortURL(shortCode, {
            accessCount: originalUrl.rows[0]!.accessCount + 1,
          });

          return originalUrl.rows[0]!;
        }

        throw new Error("Short code not found");
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteShortURL(shortCode: string): Promise<void> {
    try {
      const getCacheItem = await this.getCacheResponse(shortCode);

      if (getCacheItem) await this.clearCacheItem(shortCode);

      await this.pgClient.query("DELETE FROM urls WHERE shortCode=$1", [
        shortCode,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
