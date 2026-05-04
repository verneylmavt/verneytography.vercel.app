import * as exifr from "exifr";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

type ExifData = {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  takenAt?: string;
};

type PhotoRecord = {
  id: string;
  thumbUrl: string;
  fullUrl?: string;
  width?: number;
  height?: number;
  description?: string;
  tags?: string[];
  exif?: ExifData;
};

type Args = {
  filePath: string;
  publicDir: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    filePath: path.join("src", "content", "photos.json"),
    publicDir: "public",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === "--file" && next) {
      args.filePath = next;
      i++;
      continue;
    }
    if (current === "--public" && next) {
      args.publicDir = next;
      i++;
      continue;
    }
    if (current === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (current === "--help" || current === "-h") {
      console.log(
        [
          "photos-fill-meta",
          "",
          "Enriches src/content/photos.json entries by reading image dimensions + EXIF from thumbUrl.",
          "",
          "Usage:",
          "  npm run photos:fill-meta",
          "  npx tsx scripts/photos-fill-meta.ts",
          "",
          "Options:",
          "  --file <path>     JSON file to edit (default: src/content/photos.json)",
          "  --public <path>   Public directory for local thumbUrl paths (default: public)",
          "  --dry-run         Print summary but do not write file",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return args;
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

function formatShutterSpeed(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0)
    return undefined;
  if (value >= 1) return `${formatNumber(value)}s`;

  const denominator = Math.round(1 / value);
  if (!Number.isFinite(denominator) || denominator <= 0) return undefined;
  return `1/${denominator}`;
}

function formatAperture(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.replace(/^f\//i, "F/");
  }
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return `F/${formatNumber(value)}`;
}

function formatFocalLength(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.endsWith("mm") ? trimmed : `${trimmed}mm`;
  }
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return `${Math.round(value)}mm`;
}

function formatIso(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function formatLocalIsoWithOffset(value: unknown): string | undefined {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : null;
  if (!date || Number.isNaN(date.getTime())) return undefined;

  const pad = (num: number) => String(num).padStart(2, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(abs / 60);
  const offsetMins = abs % 60;

  // Keep consistency with the existing content: seconds are always "00".
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`,
    `${sign}${pad(offsetHours)}:${pad(offsetMins)}`,
  ].join("");
}

function normalizeSonyModel(model: string): string {
  const key = model.trim().toUpperCase();
  const map: Record<string, string> = {
    "ILCE-7M2": "A7 II",
    "ILCE-6400": "A6400",
  };
  return map[key] ?? model.trim();
}

function normalizeMake(make: string): string {
  const trimmed = make.trim();
  if (!trimmed) return make;
  if (trimmed.toUpperCase() === "SONY") return "SONY";
  return trimmed
    .toLowerCase()
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

function normalizeLens(value: string): string {
  return value
    .trim()
    .replace(/\s+OSS\b/gi, "")
    .replace(/\bF(?!\/)(\d)/g, "F/$1")
    .trim();
}

async function readThumbBuffer(thumbUrl: string, publicDir: string): Promise<{
  buffer: Buffer;
  sourceLabel: string;
}> {
  if (/^https?:\/\//i.test(thumbUrl)) {
    const response = await fetch(thumbUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch thumbUrl (${response.status}): ${thumbUrl}`,
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), sourceLabel: thumbUrl };
  }

  const cleaned = thumbUrl.startsWith("/") ? thumbUrl.slice(1) : thumbUrl;
  const resolved = path.resolve(process.cwd(), publicDir, cleaned);
  const buffer = await fs.readFile(resolved);
  return { buffer, sourceLabel: resolved };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const fileAbsolute = path.resolve(process.cwd(), args.filePath);

  const raw = await fs.readFile(fileAbsolute, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${args.filePath}`);
  }

  const photos = parsed as PhotoRecord[];
  const updated: PhotoRecord[] = [];
  const failures: { id: string; reason: string }[] = [];

  for (const photo of photos) {
    if (!photo?.id || typeof photo.id !== "string") {
      throw new Error(`Invalid entry: missing "id"`);
    }
    if (!photo.thumbUrl || typeof photo.thumbUrl !== "string") {
      throw new Error(`Invalid entry (${photo.id}): missing "thumbUrl"`);
    }

    try {
      const { buffer, sourceLabel } = await readThumbBuffer(
        photo.thumbUrl,
        args.publicDir,
      );

      const metadata = await sharp(buffer, { failOnError: false }).metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;
      if (!width || !height) {
        throw new Error(`Could not read dimensions from ${sourceLabel}`);
      }

      const rawExif = await exifr.parse(buffer, {
        translateValues: false,
        pick: [
          "Make",
          "Model",
          "LensModel",
          "Lens",
          "FocalLength",
          "FocalLengthIn35mmFormat",
          "FNumber",
          "ExposureTime",
          "ISO",
          "DateTimeOriginal",
          "CreateDate",
        ],
      });

      const make = rawExif?.Make ? normalizeMake(String(rawExif.Make)) : undefined;
      const model = rawExif?.Model
        ? normalizeSonyModel(String(rawExif.Model))
        : undefined;
      const camera =
        make || model ? [make, model].filter(Boolean).join(" ") : undefined;

      const lensRaw =
        rawExif?.LensModel
          ? String(rawExif.LensModel)
          : rawExif?.Lens
            ? String(rawExif.Lens)
            : undefined;
      const lens = lensRaw ? normalizeLens(lensRaw) : undefined;

      const exif: ExifData = {
        camera,
        lens,
        focalLength: formatFocalLength(
          rawExif?.FocalLengthIn35mmFormat ?? rawExif?.FocalLength,
        ),
        aperture: formatAperture(rawExif?.FNumber),
        shutterSpeed: formatShutterSpeed(rawExif?.ExposureTime),
        iso: formatIso(rawExif?.ISO),
        takenAt: formatLocalIsoWithOffset(
          rawExif?.DateTimeOriginal ?? rawExif?.CreateDate,
        ),
      };

      const fullUrl =
        typeof photo.fullUrl === "string" && photo.fullUrl.trim()
          ? photo.fullUrl
          : "https://s3f8qod2qyfqjhs6.public.blob.vercel-storage.com/X.jpg";

      const description =
        typeof photo.description === "string" && photo.description.trim()
          ? photo.description
          : "Description.";

      const tags =
        Array.isArray(photo.tags) && photo.tags.length > 0
          ? photo.tags
          : ["", "", ""];

      updated.push({
        ...photo,
        width,
        height,
        exif,
        fullUrl,
        description,
        tags,
      });
    } catch (error: unknown) {
      failures.push({
        id: photo.id,
        reason: error instanceof Error ? error.message : String(error),
      });
      updated.push(photo);
    }
  }

  if (failures.length > 0) {
    console.warn(`\nCompleted with ${failures.length} failures:\n`);
    for (const failure of failures) {
      console.warn(`- ${failure.id}: ${failure.reason}`);
    }
    console.warn("");
  }

  if (args.dryRun) {
    console.log(
      `Dry run: would update ${updated.length} entries -> ${args.filePath}`,
    );
    return;
  }

  await fs.writeFile(fileAbsolute, JSON.stringify(updated, null, 2) + "\n");
  console.log(`Done. Updated ${updated.length} entries -> ${args.filePath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
