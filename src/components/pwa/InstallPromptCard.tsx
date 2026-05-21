import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const INSTALL_PROMPT_DISMISSED_KEY = "luma-install-prompt-dismissed";

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function InstallPromptCard() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setPromptEvent(null);
  }

  function handleDismiss() {
    setIsDismissed(true);

    try {
      window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Ignore storage failures for this lightweight preference.
    }
  }

  if (isInstalled || isDismissed || !promptEvent) {
    return null;
  }

  return (
    <Card
      title="Pasang Luma di layar utama"
      subtitle="Biar kebuka lebih cepat, terasa kayak app beneran, dan tetap enak dipakai walau lagi offline."
      className="bg-[linear-gradient(155deg,rgba(232,168,87,0.14),rgba(143,184,150,0.10))]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[32ch] text-sm leading-6 text-[var(--text-secondary)]">
          Setelah dipasang, shell app bakal tetap kebuka dan data lokalmu tetap kebaca dari device ini.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={handleDismiss}>
            Nanti aja
          </Button>
          <Button onClick={() => void handleInstall()}>Pasang sekarang</Button>
        </div>
      </div>
    </Card>
  );
}
