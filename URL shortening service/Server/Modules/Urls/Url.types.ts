export type shortURL = {
  id: string;
  url: string;
  shortcode: string;
  createdat: string;
  updatedat: string;
  accesscount: number;
};

export type PublicShortURL = Omit<shortURL, "createdAt" | "updatedAt">;

export type createShortURLDTO = Pick<shortURL, "url" | "shortcode">;
export type updateShortURLDTO =
  | (Pick<shortURL, "shortcode"> &
      Omit<
        shortURL,
        "id" | "createdAt" | "updatedAt" | "accessCount" | "shortCode"
      >)
  | Partial<shortURL>;

export interface shortURLRepo {
  createShortURL: (longURL: string) => Promise<shortURL>;
  updateShortURL: (
    shortCode: string,
    newDetails: updateShortURLDTO,
  ) => Promise<shortURL>;
  getOriginalURL: (shortCode: string) => Promise<shortURL>;
  deleteShortURL: (shortCode: string) => Promise<void>;
}

export interface shortURLService {
  createShortURL: (longURL: string) => Promise<PublicShortURL>;
  updateShortURL: (
    shortCode: string,
    newDetails: updateShortURLDTO,
  ) => Promise<PublicShortURL>;
  getOriginalURL: (shortCode: string) => Promise<string>;
  deleteShortURL: (shortCode: string) => Promise<void>;
}
