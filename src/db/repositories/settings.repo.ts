import { getLumaDb } from "../client";
import { DEFAULT_CUSTOMIZATION } from "../../features/customization/presets";
import { nowIso } from "../../lib/date";
import type { UpdateUserSettingsInput, UserSettings } from "../../types";

export const DEFAULT_SETTINGS: UserSettings = {
  id: "main",
  name: "",
  currency: "IDR",
  themeMode: "light",
  ...DEFAULT_CUSTOMIZATION,
  mascotEnabled: true,
  aiEnabled: false,
  createdAt: nowIso(),
  updatedAt: nowIso(),
};

export const settingsRepo = {
  async get() {
    const database = await getLumaDb();
    const settings = await database.get("settings", "main");

    if (settings) {
      return settings;
    }

    await database.put("settings", DEFAULT_SETTINGS);

    return DEFAULT_SETTINGS;
  },

  async update(input: UpdateUserSettingsInput) {
    const database = await getLumaDb();
    const current = await this.get();
    const next: UserSettings = {
      ...current,
      ...input,
      updatedAt: nowIso(),
    };

    await database.put("settings", next);

    return next;
  },

  async reset() {
    const database = await getLumaDb();
    const next: UserSettings = {
      ...DEFAULT_SETTINGS,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    await database.put("settings", next);

    return next;
  },
};
