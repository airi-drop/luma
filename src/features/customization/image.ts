import type { CreateBackgroundAssetInput } from "../../types";

const MAX_WIDTH = 1080;
const WEBP_QUALITY = 0.88;

type PreparedBackgroundAsset = CreateBackgroundAssetInput & {
  previewUrl: string;
};

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gambar belum kebaca. Coba pilih file lain ya."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function getFallbackMimeType(file: File): "image/jpeg" | "image/png" {
  return file.type === "image/png" ? "image/png" : "image/jpeg";
}

export async function prepareBackgroundAsset(
  file: File,
): Promise<PreparedBackgroundAsset> {
  const image = await loadImageFromFile(file);
  const targetWidth = Math.min(image.width, MAX_WIDTH);
  const targetHeight = Math.max(
    1,
    Math.round((image.height / image.width) * targetWidth),
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas belum siap dipakai untuk kompres gambar.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  let mimeType: "image/webp" | "image/jpeg" | "image/png" = "image/webp";

  if (!blob) {
    mimeType = getFallbackMimeType(file);
    blob = await canvasToBlob(
      canvas,
      mimeType,
      mimeType === "image/jpeg" ? WEBP_QUALITY : undefined,
    );
  }

  if (!blob) {
    throw new Error("Gambarnya belum bisa diproses. Coba file lain ya.");
  }

  return {
    name: file.name.replace(/\.[^.]+$/, "") || "Background Luma",
    blob,
    mimeType,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: blob.size,
    previewUrl: URL.createObjectURL(blob),
  };
}
