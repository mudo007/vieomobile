import * as ImagePicker from 'expo-image-picker';

import type { SelectedVideo } from '@/src/domain/creator';
import type { PickCreatorVideoResult, VideoPickerPort } from '@/src/use-cases/creator';

const mediaPermissionDeniedMessage = 'Media library access is required.';
const unsupportedVideoMessage = 'Only video files from the media library are supported.';

export class ExpoVideoPicker implements VideoPickerPort {
  async pickVideo(): Promise<PickCreatorVideoResult> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

    if (!permission.granted) {
      return {
        type: 'permissionDenied',
        message: mediaPermissionDeniedMessage,
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) {
      return { type: 'cancelled' };
    }

    const asset = result.assets[0];

    if (!asset || asset.type !== 'video') {
      return {
        type: 'unsupportedVideo',
        message: unsupportedVideoMessage,
      };
    }

    return {
      type: 'videoSelected',
      video: mapImagePickerAssetToSelectedVideo(asset),
    };
  }
}

export function createExpoVideoPicker(): ExpoVideoPicker {
  return new ExpoVideoPicker();
}

function mapImagePickerAssetToSelectedVideo(asset: ImagePicker.ImagePickerAsset): SelectedVideo {
  return {
    uri: asset.uri,
    assetId: asset.assetId ?? undefined,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
    durationMs: asset.duration ?? undefined,
    sizeBytes: asset.fileSize ?? undefined,
  };
}
