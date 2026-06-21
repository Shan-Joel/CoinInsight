// Native (Expo Go) has no in-bundle view-to-image capture, so we fall back to
// sharing a text summary. This file keeps html-to-image out of the native bundle.
export async function captureToImage() {
  return null;
}

export const canCaptureImage = false;
