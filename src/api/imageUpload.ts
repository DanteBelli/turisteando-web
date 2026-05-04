import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * Upload an event image to the backend
 * @param file - The image File object from the file picker
 * @param token - JWT authentication token
 * @returns Promise<string> - The public URL of the uploaded image
 */
export const uploadEventImage = async (file: File, token: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(
      `${API_BASE_URL}/events/upload/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ Image uploaded successfully:', response.data.image_url);
    return response.data.image_url;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};
