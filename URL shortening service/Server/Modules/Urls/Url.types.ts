export type shortURL = {
  id: string;
  url: string;
  shortCode: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
};

export type PublicShortURL = Omit<shortURL, "createdAt" | "updatedAt">;

export type createShortURLDTO = Pick<shortURL, "url" | "shortCode">;
export type updateShortURLDTO =
  | (Pick<shortURL, "shortCode"> &
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
