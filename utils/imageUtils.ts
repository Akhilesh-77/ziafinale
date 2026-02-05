
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

/**
 * Compresses an image blob if it exceeds a certain size.
 * Resizes large images to max 1280px dimension (or 1600px/3840px based on args) and uses JPEG compression.
 * optimized for Mobile performance.
 */
export async function compressImage(file: Blob, maxWidth = 1280, quality = 0.8): Promise<Blob> {
    // Skip small files (e.g. < 2.5MB) to save processing time on mobile.
    // 2.5MB is reasonably small for Dexie/IndexedDB and allows instant saving for most phone shots.
    if (file.size < 2.5 * 1024 * 1024) return file;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            let { width, height } = img;
            
            // Calculate new dimensions
            if (width > maxWidth || height > maxWidth) {
                const ratio = width / height;
                if (width > height) {
                    width = maxWidth;
                    height = width / ratio;
                } else {
                    height = maxWidth;
                    width = height * ratio;
                }
            } else if (file.size < 3.5 * 1024 * 1024) {
                // If dimensions are small enough but size is borderline (between 2.5 and 3.5MB), 
                // skip canvas processing to prioritize speed over space.
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(file);
                return;
            }

            // Draw and compress
            // Using a slightly lower quality for mobile speed if not 4k
            const effectiveQuality = maxWidth > 2000 ? quality : 0.7;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    // Only use compressed if it's actually smaller
                    resolve(blob.size < file.size ? blob : file);
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', effectiveQuality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };

        img.src = url;
    });
}
