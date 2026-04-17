export type ExifData = {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  takenAt?: string;
};

export type Photo = {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  description: string;
  tags: string[];
  exif?: ExifData;
};

