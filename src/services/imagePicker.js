import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Pick (or capture) a coin photo and return it as base64.
// On web this opens the file dialog; on a device it opens the photo library
// (where the user can also take a new photo). Returns null if cancelled.
export async function pickCoinImage() {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const e = new Error('Photo permission denied.');
      e.code = 'NO_PERMISSION';
      throw e;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
    base64: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64,
    mediaType: asset.mimeType || 'image/jpeg',
  };
}
