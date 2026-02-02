import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const AVATAR_BUCKET = 'avatars';

/**
 * Pick an image, upload to Supabase Storage, and update the user profile.
 * Returns the public URL of the uploaded avatar, or null if cancelled.
 */
export async function uploadAvatar(
  userId: string,
  source: 'camera' | 'library'
): Promise<string | null> {
  // Request permissions
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission is required to take a photo.');
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Photo library permission is required to select a photo.');
    }
  }

  // Launch picker
  const launchFn =
    source === 'camera'
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

  const result = await launchFn({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null; // User cancelled
  }

  const asset = result.assets[0];
  const base64Data = asset.base64;

  if (!base64Data) {
    throw new Error('Failed to read image data.');
  }

  // Determine file extension from URI
  const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const filePath = `${userId}/avatar_${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, decode(base64Data), {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    throw new Error('Failed to upload avatar image.');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Update user profile with avatar URL
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Profile update error:', updateError);
    throw new Error('Failed to update profile with avatar.');
  }

  return publicUrl;
}
