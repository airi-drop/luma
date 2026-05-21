import { create } from "zustand";
import { DEFAULT_CUSTOMIZATION } from "../features/customization/presets";
import { backgroundsRepo } from "../db/repositories/backgrounds.repo";
import { settingsRepo } from "../db/repositories/settings.repo";
import type {
  BackgroundAsset,
  CreateBackgroundAssetInput,
  UpdateUserSettingsInput,
  UserSettings,
} from "../types";

interface SettingsState {
  settings: UserSettings | null;
  backgrounds: BackgroundAsset[];
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  updateSettings: (input: UpdateUserSettingsInput) => Promise<UserSettings>;
  resetCustomization: () => Promise<UserSettings>;
  createBackground: (
    input: CreateBackgroundAssetInput,
  ) => Promise<BackgroundAsset>;
  removeBackground: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  backgrounds: [],
  isLoading: false,
  error: null,
  async hydrate() {
    set({ isLoading: true, error: null });

    try {
      const [settings, backgrounds] = await Promise.all([
        settingsRepo.get(),
        backgroundsRepo.listAll(),
      ]);

      set({
        settings,
        backgrounds,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal memuat settings.",
      });
    }
  },
  async updateSettings(input) {
    const settings = await settingsRepo.update(input);
    set({ settings });
    return settings;
  },
  async resetCustomization() {
    const settings = await settingsRepo.update(DEFAULT_CUSTOMIZATION);
    set({ settings });
    return settings;
  },
  async createBackground(input) {
    const background = await backgroundsRepo.create(input);
    set((state) => ({
      backgrounds: [background, ...state.backgrounds],
    }));
    return background;
  },
  async removeBackground(id) {
    const wasActive = get().settings?.backgroundId === id;

    await backgroundsRepo.remove(id);
    const nextSettings = wasActive
      ? await settingsRepo.update({ backgroundId: undefined })
      : null;

    set((state) => ({
      backgrounds: state.backgrounds.filter((background) => background.id !== id),
      settings: nextSettings ?? state.settings,
    }));
  },
}));
