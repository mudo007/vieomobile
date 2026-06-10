// Models
export type SelectedVideo = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  durationMs?: number;
  sizeBytes?: number;
};

export type UploadedVideo = {
  id: string;
  title: string;
  sourceUri: string;
};

// Failed states
export type CreatorUploadFailure =
  | {
    type: 'mediaPermissionDenied';
    message: string;
  }
  | {
    type: 'unsupportedVideo';
    message: string;
    video?: SelectedVideo;
  }
  | {
    type: 'uploadFailed';
    message: string;
  }
  | {
    type: 'unexpected';
    message: string;
  };

export type CreatorUploadValidationFailure = {
  type: 'missingTitle';
  message: string;
};

// Valid states
export type CreatorUploadState =
  | {
    status: 'idle';
  }
  | {
    status: 'picking';
  }
  | {
    status: 'editing';
    video: SelectedVideo;
    title: string;
    description: string;
    titleError?: CreatorUploadValidationFailure;
  }
  | {
    status: 'uploading';
    video: SelectedVideo;
    title: string;
    description: string;
    progress: number;
  }
  | {
    status: 'uploaded';
    uploadedVideo: UploadedVideo;
  }
  | {
    status: 'failed';
    failure: CreatorUploadFailure;
  };

// State machine events
export type CreatorUploadEvent =
  | {
    type: 'startPicking';
  }
  | {
    type: 'cancelPicking';
  }
  | {
    type: 'mediaPermissionDenied';
    message: string;
  }
  | {
    type: 'videoSelected';
    video: SelectedVideo;
  }
  | {
    type: 'unsupportedVideoPicked';
    message: string;
    video?: SelectedVideo;
  }
  | {
    type: 'changeTitle';
    title: string;
  }
  | {
    type: 'changeDescription';
    description: string;
  }
  | {
    type: 'cancelEditing';
  }
  | {
    type: 'confirmUpload';
  }
  | {
    type: 'cancelUpload';
  }
  | {
    type: 'uploadProgressed';
    progress: number;
  }
  | {
    type: 'uploadSucceeded';
    uploadedVideo: UploadedVideo;
  }
  | {
    type: 'uploadFailed';
    message: string;
  }
  | {
    type: 'unexpectedFailure';
    message: string;
  }
  | {
    type: 'reset';
  };

  // Interfaces
export type CreatorUploadStatus = CreatorUploadState['status'];

export type CreatorUploadEventType = CreatorUploadEvent['type'];

export type CreatorUploadTransition = {
  from: CreatorUploadStatus;
  event: CreatorUploadEventType;
  to: CreatorUploadStatus;
};
