export type FollowerFeedVideo = {
  id: string;
  title: string;
  creatorName: string;
  durationLabel: string;
};

export type FollowerFeedState =
  | {
      status: 'loading';
    }
  | {
      status: 'ready';
      videos: FollowerFeedVideo[];
    }
  | {
      status: 'refreshing';
      videos: FollowerFeedVideo[];
    }
  | {
      status: 'playing';
      video: FollowerFeedVideo;
      videos: FollowerFeedVideo[];
    }
  | {
      status: 'empty';
    }
  | {
      status: 'failed';
      message: string;
    };

export type FollowerFeedEvent =
  | {
      type: 'feedLoaded';
      videos: FollowerFeedVideo[];
    }
  | {
      type: 'feedLoadFailed';
      message: string;
    }
  | {
      type: 'refreshFeed';
    }
  | {
      type: 'videoSelected';
      video: FollowerFeedVideo;
    }
  | {
      type: 'closeVideo';
    };
