import { nanoid } from "nanoid";
import { getLumaDb } from "../client";
import { nowIso } from "../../lib/date";
import type { BackgroundAsset, CreateBackgroundAssetInput } from "../../types";

export const backgroundsRepo = {
  async create(input: CreateBackgroundAssetInput) {
    const database = await getLumaDb();
    const asset: BackgroundAsset = {
      id: nanoid(),
      name: input.name.trim(),
      blob: input.blob,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      sizeBytes: input.sizeBytes,
      createdAt: nowIso(),
    };

    await database.put("backgrounds", asset);

    return asset;
  },

  async getById(id: string) {
    const database = await getLumaDb();
    return database.get("backgrounds", id);
  },

  async listAll() {
    const database = await getLumaDb();
    const items = await database.getAll("backgrounds");
    return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  async remove(id: string) {
    const database = await getLumaDb();
    await database.delete("backgrounds", id);
  },
};
