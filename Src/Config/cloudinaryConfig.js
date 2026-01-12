// Cloudinary Configuration
// Your Cloudinary credentials from: https://cloudinary.com/console

export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name
  CLOUD_NAME: 'dyntz8gvj',

  // Your upload preset (create one in Settings > Upload > Upload presets)
  // Make sure to set it as "unsigned" for client-side uploads
  // IMPORTANT: You need to create this preset in your Cloudinary dashboard
  // Suggested name: 'electricity_bills_unsigned'
  UPLOAD_PRESET: 'electricity_bills_unsigned', // Update this after creating the preset

  // API Key (for reference, not used in unsigned uploads)
  API_KEY: '',

  // API Secret (NEVER expose this in production client-side code!)
  // Only included here for reference - not used in client-side uploads
  // API_SECRET: 'd1o2ujwWL6QWxKdJFHFwXuQCzdo',
};

// Default folder for electricity bill images
export const DEFAULT_FOLDER = 'electricity-bills';

// Placeholder image URL (update with your own placeholder if needed)
export const PLACEHOLDER_IMAGE_URL =
  'https://res.cloudinary.com/dyntz8gvj/image/upload/v1/placeholder.jpg';
