import type { CharacterConfig, ThemeConfig, UserSettings } from "../../types";

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "cozy-dark",
    name: "Cozy Dark",
    mode: "dark",
    decorativeStyle: "blob",
    tokens: {
      "bg-main": "#1A1410",
      "bg-card": "rgba(42, 33, 27, 0.82)",
      "bg-card-soft": "rgba(52, 42, 34, 0.88)",
      "bg-elevated": "#241C16",
      "text-primary": "#FFF3DC",
      "text-secondary": "#CDBEA8",
      "text-muted": "#9C8D7B",
      "text-on-accent": "#2B211A",
      "accent-primary": "#E8A857",
      "accent-secondary": "#8FB896",
      "accent-soft": "#F4D6A0",
      "accent-surface": "rgba(232, 168, 87, 0.16)",
      "warning-soft": "#E8A857",
      "danger-soft": "#D96C5F",
      "success-soft": "#8FB896",
      "border-soft": "rgba(255, 243, 220, 0.1)",
      "overlay-base-rgb": "26, 20, 16",
      "overlay-glow-primary": "232, 168, 87",
      "overlay-glow-secondary": "143, 184, 150",
      "shadow-card": "0 12px 40px rgba(0, 0, 0, 0.28)",
    },
  },
  {
    id: "cream-latte",
    name: "Cream Latte",
    mode: "light",
    decorativeStyle: "cafe",
    tokens: {
      "bg-main": "#FFF3DC",
      "bg-card": "rgba(255, 255, 255, 0.84)",
      "bg-card-soft": "rgba(247, 231, 204, 0.92)",
      "bg-elevated": "#FFF8EE",
      "text-primary": "#2B211A",
      "text-secondary": "#6E5A48",
      "text-muted": "#A08D7A",
      "text-on-accent": "#2B211A",
      "accent-primary": "#D88938",
      "accent-secondary": "#8FB896",
      "accent-soft": "#F2C879",
      "accent-surface": "rgba(216, 137, 56, 0.14)",
      "warning-soft": "#D88938",
      "danger-soft": "#C76E63",
      "success-soft": "#7EA889",
      "border-soft": "rgba(110, 74, 46, 0.12)",
      "overlay-base-rgb": "255, 243, 220",
      "overlay-glow-primary": "216, 137, 56",
      "overlay-glow-secondary": "143, 184, 150",
      "shadow-card": "0 12px 32px rgba(92, 64, 38, 0.12)",
    },
  },
  {
    id: "sakura-dream",
    name: "Sakura Dream",
    mode: "light",
    decorativeStyle: "soft",
    tokens: {
      "bg-main": "#FFF5F7",
      "bg-card": "rgba(255, 255, 255, 0.86)",
      "bg-card-soft": "rgba(251, 230, 236, 0.92)",
      "bg-elevated": "#FFF9FB",
      "text-primary": "#442B35",
      "text-secondary": "#7A5965",
      "text-muted": "#A68792",
      "text-on-accent": "#442B35",
      "accent-primary": "#E89AAE",
      "accent-secondary": "#B9A0E6",
      "accent-soft": "#F8C8D4",
      "accent-surface": "rgba(232, 154, 174, 0.14)",
      "warning-soft": "#E89AAE",
      "danger-soft": "#D77083",
      "success-soft": "#9BBF9B",
      "border-soft": "rgba(122, 89, 101, 0.12)",
      "overlay-base-rgb": "255, 245, 247",
      "overlay-glow-primary": "232, 154, 174",
      "overlay-glow-secondary": "185, 160, 230",
      "shadow-card": "0 14px 36px rgba(143, 102, 120, 0.12)",
    },
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    mode: "dark",
    decorativeStyle: "minimal",
    tokens: {
      "bg-main": "#111827",
      "bg-card": "rgba(23, 34, 54, 0.84)",
      "bg-card-soft": "rgba(31, 46, 72, 0.88)",
      "bg-elevated": "#172236",
      "text-primary": "#F3F6FF",
      "text-secondary": "#BCC8DF",
      "text-muted": "#8997B1",
      "text-on-accent": "#112033",
      "accent-primary": "#8DB6FF",
      "accent-secondary": "#8FD5C6",
      "accent-soft": "#C4D9FF",
      "accent-surface": "rgba(141, 182, 255, 0.16)",
      "warning-soft": "#8DB6FF",
      "danger-soft": "#F29A94",
      "success-soft": "#8FD5C6",
      "border-soft": "rgba(243, 246, 255, 0.12)",
      "overlay-base-rgb": "17, 24, 39",
      "overlay-glow-primary": "141, 182, 255",
      "overlay-glow-secondary": "143, 213, 198",
      "shadow-card": "0 12px 40px rgba(6, 10, 18, 0.32)",
    },
  },
];

export const CHARACTER_PRESETS: CharacterConfig[] = [
  {
    id: "otter",
    name: "Otter",
    type: "default",
    style: "cozy",
    assetMap: {
      happy: "Otter senyum hangat",
      chill: "Otter santai",
      worried: "Otter mikir pelan",
      panic: "Otter kaget lucu",
      success: "Otter kasih tepuk kecil",
    },
  },
  {
    id: "cat",
    name: "Cat",
    type: "default",
    style: "cute",
    assetMap: {
      happy: "Cat kedip manis",
      chill: "Cat duduk kalem",
      worried: "Cat melirik saldo",
      panic: "Cat meong panik",
      success: "Cat angkat paw",
    },
  },
  {
    id: "bunny",
    name: "Bunny",
    type: "default",
    style: "cozy",
    assetMap: {
      happy: "Bunny lompat kecil",
      chill: "Bunny adem",
      worried: "Bunny peluk dompet",
      panic: "Bunny kaget imut",
      success: "Bunny kasih confetti mini",
    },
  },
  {
    id: "hamster",
    name: "Hamster",
    type: "default",
    style: "minimal",
    assetMap: {
      happy: "Hamster pipi penuh",
      chill: "Hamster anteng",
      worried: "Hamster ngitung pelan",
      panic: "Hamster muter cepat",
      success: "Hamster angkat koin",
    },
  },
];

export const DEFAULT_CUSTOMIZATION: Pick<
  UserSettings,
  | "activeThemeId"
  | "activeCharacterId"
  | "backgroundId"
  | "backgroundBlur"
  | "backgroundOverlayOpacity"
> = {
  activeThemeId: "cozy-dark",
  activeCharacterId: "otter",
  backgroundId: undefined,
  backgroundBlur: 0,
  backgroundOverlayOpacity: 72,
};

export function getThemeById(themeId?: string) {
  return THEME_PRESETS.find((theme) => theme.id === themeId) ?? THEME_PRESETS[0];
}

export function getCharacterById(characterId?: string) {
  return (
    CHARACTER_PRESETS.find((character) => character.id === characterId) ??
    CHARACTER_PRESETS[0]
  );
}
