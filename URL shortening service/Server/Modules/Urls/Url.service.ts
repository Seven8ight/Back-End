import type {
  shortURLRepo,
  shortURLService,
  updateShortURLDTO,
} from "./Url.types.js";

export class UrlService implements shortURLService {
  constructor(private urlRepo: shortURLRepo) {}

  async createShortURL(longURL: string) {
    if (!longURL || longURL.length <= 0)
      throw new Error("Invalid URL passed in");

    try {
      return await this.urlRepo.createShortURL(longURL);
    } catch (error) {
      throw error;
    }
  }

  async updateShortURL(shortCode: string, newDetails: updateShortURLDTO) {
    if (!shortCode || shortCode.length <= 0)
      throw new Error("Invalid short code passed in");

    try {
      return await this.urlRepo.updateShortURL(shortCode, newDetails);
    } catch (error) {
      throw error;
    }
  }

  async getOriginalURL(shortCode: string) {
    if (!shortCode || shortCode.length <= 0)
      throw new Error("Invalid short code passed in");

    try {
      const originalURL = await this.urlRepo.getOriginalURL(shortCode);

      await this.urlRepo.updateShortURL(originalURL.shortCode, {
        accessCount: originalURL.accessCount + 1,
      });

      return originalURL.url;
    } catch (error) {
      throw error;
    }
  }

  async deleteShortURL(shortCode: string) {
    if (!shortCode || shortCode.length <= 0)
      throw new Error("Invalid short code passed in");

    try {
      return this.urlRepo.deleteShortURL(shortCode);
    } catch (error) {
      throw error;
    }
  }
}
