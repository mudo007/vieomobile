import { useEffect, useRef } from 'react';

import type { CreatorUploadEvent, CreatorUploadState } from '@/src/domain/creator';
import {
  uploadCreatorVideo,
  type UploadedVideoRepositoryPort,
  type VideoUploaderPort,
} from '@/src/use-cases/creator';

type UseCreatorUploadParams = {
  state: CreatorUploadState;
  videoUploader: VideoUploaderPort;
  uploadedVideos?: UploadedVideoRepositoryPort;
  dispatch: (event: CreatorUploadEvent) => void;
};

export function useCreatorUpload({
  state,
  videoUploader,
  uploadedVideos,
  dispatch,
}: UseCreatorUploadParams) {
  const latestState = useRef(state);
  latestState.current = state;

  const uploadSessionKey =
    state.status === 'uploading' ? `${state.video.uri}:${state.title}` : null;

  useEffect(() => {
    const uploadState = latestState.current;

    if (uploadState.status !== 'uploading') {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    void uploadCreatorVideo(
      uploadState,
      {
        videoUploader,
        uploadedVideos,
        onProgressEvent: (event) => {
          if (isActive) {
            dispatch(event);
          }
        },
      },
      controller.signal
    ).then((event) => {
      if (isActive && event) {
        dispatch(event);
      }
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [dispatch, uploadSessionKey, uploadedVideos, videoUploader]);
}
