import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage, trying to create the bucket 'uploads' if it doesn't exist.
 * If the upload fails due to storage config/bucket/policy issues, it falls back to base64.
 * Returns the public URL or the base64 string.
 */
export async function uploadImageToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const bucketName = 'uploads';
  // Clean file name to prevent path issues
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;

  try {
    // 1. Try to upload the file to the 'uploads' bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      });

    // If there is an error, check if it's because the bucket doesn't exist
    if (error) {
      console.warn("Storage upload error, trying to create bucket:", error);
      
      // Try to create the bucket using JS SDK
      try {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
        });

        if (createError) {
          console.error("Could not create bucket:", createError);
          throw error; // throw original upload error to trigger base64 fallback
        }

        // Try uploading again after creating the bucket
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '31536000',
            upsert: true,
          });

        if (retryError) {
          throw retryError;
        }
      } catch (bucketErr) {
        console.error("Error managing bucket, falling back to base64:", bucketErr);
        throw error; // Trigger base64 fallback
      }
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.warn("Supabase Storage failed or is unconfigured, falling back to base64:", err);
    
    // Fallback to base64 using a Promise-wrapped FileReader with compression
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Skip compression for GIFs to preserve animation
          if (file.type === 'image/gif') {
            resolve(reader.result);
            return;
          }

          // Compress the image before returning
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to JPEG with 0.7 quality to save space
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedBase64);
          };
          img.onerror = () => reject(new Error("Failed to load image for compression"));
          img.src = reader.result;
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
