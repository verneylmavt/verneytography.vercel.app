import dotenv from "dotenv";
import { put } from "@vercel/blob";
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
  fullUrl: string;
  width: number;
  height: number;
  description: string;
  tags: string[];
  exif?: ExifData;
};

type Args = {
  srcDir: string;
  outFile: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    srcDir: "photos-src",
    outFile: path.join("src", "content", "photos.json"),
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === "--src" && next) {
      args.srcDir = next;
      i++;
      continue;
    }
    if (current === "--out" && next) {
      args.outFile = next;
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
          "photos-sync",
          "",
          "Usage:",
          "  npm run photos:sync",
          "",
          "Options:",
          "  --src <dir>     Source folder (default: photos-src)",
          "  --out <file>    Output JSON file (default: src/content/photos.json)",
          "  --dry-run       Generate metadata without uploading to Blob",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return args;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function toShutterSpeed(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  if (value <= 0) return undefined;
  if (value >= 1) return `${value}s`;

  const denominator = Math.round(1 / value);
  if (!Number.isFinite(denominator) || denominator <= 0) return undefined;
  return `1/${denominator}`;
}

function toAperture(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return `f/${value}`;
}

function toFocalLength(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return `${Math.round(value)}mm`;
}

function toIso(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }
  return undefined;
}

async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readPhotos(filePath: string): Promise<PhotoRecord[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PhotoRecord[];
  } catch {
    return [];
  }
}

function sortPhotos(photos: PhotoRecord[]): PhotoRecord[] {
  return [...photos].sort((a, b) => {
    const aDate = a.exif?.takenAt ? Date.parse(a.exif.takenAt) : NaN;
    const bDate = b.exif?.takenAt ? Date.parse(b.exif.takenAt) : NaN;

    if (Number.isFinite(aDate) && Number.isFinite(bDate)) return bDate - aDate;
    if (Number.isFinite(aDate)) return -1;
    if (Number.isFinite(bDate)) return 1;

    return a.id.localeCompare(b.id);
  });
}

async function main(): Promise<void> {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });

  const args = parseArgs(process.argv.slice(2));
  const srcDirAbsolute = path.resolve(process.cwd(), args.srcDir);
  const outFileAbsolute = path.resolve(process.cwd(), args.outFile);

  await ensureDir(outFileAbsolute);

  const existing = await readPhotos(outFileAbsolute);
  const existingById = new Map(existing.map((photo) => [photo.id, photo]));

  let entries: string[];
  try {
    entries = await fs.readdir(srcDirAbsolute);
  } catch {
    throw new Error(
      `Source folder not found: ${args.srcDir}. Create it and add images to sync.`,
    );
  }

  const imageFiles = entries
    .filter((file) => !file.startsWith("."))
    .filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"].includes(
        path.extname(file).toLowerCase(),
      ),
    );

  if (!args.dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN. Add it to .env.local (see .env.example).",
    );
  }

  const seen = new Set<string>();
  const updated: PhotoRecord[] = [...existing];

  for (const fileName of imageFiles) {
    const filePath = path.join(srcDirAbsolute, fileName);
    const id = slugify(path.parse(fileName).name);
    if (!id) continue;

    if (seen.has(id)) {
      throw new Error(
        `Duplicate id detected (${id}). Rename one of the files to avoid collisions.`,
      );
    }
    seen.add(id);

    console.log(`Processing: ${fileName} -> ${id}`);

    const original = sharp(filePath, { failOnError: false }).rotate();

    const fullBuffer = await original
      .clone()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    const thumbBuffer = await original
      .clone()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    const fullMeta = await sharp(fullBuffer).metadata();
    const width = fullMeta.width ?? 0;
    const height = fullMeta.height ?? 0;
    if (!width || !height) {
      throw new Error(`Could not read image dimensions for: ${fileName}`);
    }

    const rawExif = await exifr.parse(filePath, {
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

    const make = rawExif?.Make ? String(rawExif.Make) : undefined;
    const model = rawExif?.Model ? String(rawExif.Model) : undefined;
    const camera =
      make || model ? [make, model].filter(Boolean).join(" ") : undefined;
    const lens =
      rawExif?.LensModel
        ? String(rawExif.LensModel)
        : rawExif?.Lens
          ? String(rawExif.Lens)
          : undefined;

    const derivedExif: ExifData = {
      camera,
      lens,
      focalLength: toFocalLength(
        rawExif?.FocalLengthIn35mmFormat ?? rawExif?.FocalLength,
      ),
      aperture: toAperture(rawExif?.FNumber),
      shutterSpeed: toShutterSpeed(rawExif?.ExposureTime),
      iso: toIso(rawExif?.ISO),
      takenAt: toIsoString(rawExif?.DateTimeOriginal ?? rawExif?.CreateDate),
    };

    const existingRecord = existingById.get(id);
    const description = existingRecord?.description ?? titleCase(id);
    const tags = existingRecord?.tags ?? [];
    const exifData: ExifData = {
      ...(existingRecord?.exif ?? {}),
      ...derivedExif,
    };

    let thumbUrl = existingRecord?.thumbUrl ?? "";
    let fullUrl = existingRecord?.fullUrl ?? "";

    if (!args.dryRun) {
      const thumbResult = await put(`photos/${id}/thumb.jpg`, thumbBuffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/jpeg",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      const fullResult = await put(`photos/${id}/full.jpg`, fullBuffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/jpeg",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      thumbUrl = thumbResult.url;
      fullUrl = fullResult.url;
    }

    const nextRecord: PhotoRecord = {
      id,
      thumbUrl,
      fullUrl,
      width,
      height,
      description,
      tags,
      exif: exifData,
    };

    const index = updated.findIndex((photo) => photo.id === id);
    if (index === -1) updated.push(nextRecord);
    else updated[index] = nextRecord;
  }

  const finalPhotos = sortPhotos(updated);
  await fs.writeFile(outFileAbsolute, JSON.stringify(finalPhotos, null, 2) + "\n");

  console.log(
    args.dryRun
      ? `Done (dry-run). Wrote ${finalPhotos.length} entries -> ${args.outFile}`
      : `Done. Synced ${imageFiles.length} files and wrote ${finalPhotos.length} entries -> ${args.outFile}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
