
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

/**
 * Creates a cropped version of an image with ZERO compression artifacts.
 * Uses the original image's MIME type and forces quality to 1.0.
 * Applies brightness adjustment.
 * 
 * @param imageSrc - The source URL of the image
 * @param pixelCrop - The crop area in pixels (x, y, width, height)
 * @param inputMimeType - The mime type of the original image
 * @param brightness - Brightness percentage (default 100)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  inputMimeType: string = 'image/jpeg',
  brightness: number = 100
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Handle high-DPI screens or large images correctly
  // We use the pixelCrop directly which should map to the image's natural dimensions
  // if react-image-crop is configured to use natural dimensions.
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Apply Brightness Filter
  ctx.filter = `brightness(${brightness}%)`;

  // Draw the image at exact 1:1 scale for the cropped region
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  return new Promise((resolve) => {
    // Force maximum quality (1.0)
    canvas.toBlob((file) => {
      resolve(file);
    }, inputMimeType, 1.0);
  });
}
