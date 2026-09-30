export interface ImageStorage {
  name: string;
  uploadImage(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ url: string; key: string }>;
  deleteImage(key: string): Promise<boolean>;
}

export class LocalImageStorage implements ImageStorage {
  public name = 'local-storage';

  async uploadImage(_fileBuffer: Buffer, filename: string, _mimeType: string): Promise<{ url: string; key: string }> {
    const key = `uploads/${Date.now()}_${filename}`;
    return {
      url: `/static/${key}`,
      key,
    };
  }

  async deleteImage(_key: string): Promise<boolean> {
    return true;
  }
}

export const imageStorage = new LocalImageStorage();
