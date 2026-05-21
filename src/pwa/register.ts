import { registerSW } from "virtual:pwa-register";

let hasRegistered = false;

export function registerServiceWorker() {
  if (hasRegistered || !("serviceWorker" in navigator)) {
    return;
  }

  hasRegistered = true;

  registerSW({
    immediate: true,
  });
}
