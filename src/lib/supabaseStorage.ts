
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Generate a unique filename for uploads
export const generateUniqueFileName = (userId: string, fileExt: string): string => {
  const timestamp = new Date().getTime();
  return `${userId}/${timestamp}.${fileExt}`;
};

// Get file extension from file name or mime type
export const getFileExtension = (file: File): string => {
  // Try to get extension from file name
  const fileNameParts = file.name.split('.');
  if (fileNameParts.length > 1) {
    return fileNameParts.pop()?.toLowerCase() || 'png';
  }
  
  // If no extension in filename, try to get from mime type
  const mimeTypeParts = file.type.split('/');
  if (mimeTypeParts.length === 2) {
    return mimeTypeParts[1].toLowerCase();
  }
  
  // Default to png if we couldn't determine the extension
  return 'png';
};

// Upload a file to Supabase Storage
export const uploadFile = async (
  file: File,
  bucketName: string,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = getFileExtension(file);
    const filePath = generateUniqueFileName(userId, fileExt);
    
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

// Delete a file from Supabase Storage
export const deleteFile = async (
  filePath: string,
  bucketName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};
