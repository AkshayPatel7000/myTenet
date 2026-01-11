import {generateUniqueId} from './helperFunction';
import {
  CLOUDINARY_CONFIG,
  DEFAULT_FOLDER,
  PLACEHOLDER_IMAGE_URL,
} from '../Config/cloudinaryConfig';

/**
 * Upload image to Cloudinary
 * @param {string} imageUri - Local file path of the image
 * @param {string} folder - Optional folder name in Cloudinary (default: 'electricity-bills')
 * @returns {Promise<string>} - Returns the secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  imageUri,
  folder = DEFAULT_FOLDER,
) => {
  try {
    console.log('Starting Cloudinary upload for:', imageUri);

    // Create FormData for upload
    const formData = new FormData();

    // Generate unique public ID
    const publicId = `${folder}/${generateUniqueId()}`;

    // Append image file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${generateUniqueId()}.jpg`,
    });

    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    formData.append('public_id', publicId);
    formData.append('folder', folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const data = await response.json();

    if (data.secure_url) {
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;
    } else {
      throw new Error('Upload failed: No secure URL returned');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>} - Returns true if deletion was successful
 */
export const deleteImageFromCloudinary = async publicId => {
  try {
    // Note: Deletion requires authentication and should ideally be done from backend
    // This is a placeholder for future implementation
    console.log('Delete image:', publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Export constants for use in other files
export {DEFAULT_FOLDER, PLACEHOLDER_IMAGE_URL};
