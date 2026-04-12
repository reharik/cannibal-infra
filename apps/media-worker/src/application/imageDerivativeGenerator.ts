import sharp from 'sharp';

const DISPLAY_MAX_EDGE = 1600;
const THUMBNAIL_MAX_EDGE = 480;
const DERIVATIVE_MIME = 'image/jpeg';
const JPEG_QUALITY = 85;

export type GeneratedDerivative = {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
};

export type ImageDerivatives = {
  display: GeneratedDerivative;
  thumbnail: GeneratedDerivative;
};

const resizeToDerivative = async (
  originalBuffer: Buffer,
  maxEdge: number,
): Promise<GeneratedDerivative> => {
  const { data, info } = await sharp(originalBuffer)
    .rotate()
    .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  if (info.width == null || info.height == null) {
    throw new Error('Derivative dimensions missing after resize');
  }

  return {
    buffer: data,
    mimeType: DERIVATIVE_MIME,
    width: info.width,
    height: info.height,
    fileSizeBytes: data.length,
  };
};

export const generateImageDerivatives = async (
  originalBuffer: Buffer,
): Promise<ImageDerivatives> => {
  const display = await resizeToDerivative(originalBuffer, DISPLAY_MAX_EDGE);
  const thumbnail = await resizeToDerivative(originalBuffer, THUMBNAIL_MAX_EDGE);
  return { display, thumbnail };
};
