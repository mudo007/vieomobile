import type { VideoSource } from 'expo-video';

import type { VideoThumbnailSource } from '@/src/domain/creator';
import { describeMediaSource, logMediaDebug } from '@/src/diagnostics/media-debug-log';
import type {
  GenerateVideoThumbnailInput,
  VideoThumbnailGeneratorPort,
} from '@/src/use-cases/creator';

type ThumbnailPlayer = {
  replaceAsync(source: VideoSource): Promise<void>;
  generateThumbnailsAsync(
    times: number | number[],
    options?: { maxWidth?: number; maxHeight?: number }
  ): Promise<VideoThumbnailSource[]>;
  release(): void;
};

type CreateThumbnailPlayer = (source: VideoSource) => Promise<ThumbnailPlayer> | ThumbnailPlayer;

type ExpoVideoThumbnailGeneratorOptions = {
  retryCount?: number;
  retryDelayMs?: number;
};

const defaultMaxThumbnailWidth = 960;
const defaultRetryCount = 3;
const defaultRetryDelayMs = 75;

export class ExpoVideoThumbnailGenerator implements VideoThumbnailGeneratorPort {
  private readonly retryCount: number;
  private readonly retryDelayMs: number;

  constructor(
    private readonly createPlayer: CreateThumbnailPlayer = createExpoVideoPlayer,
    options: ExpoVideoThumbnailGeneratorOptions = {}
  ) {
    this.retryCount = options.retryCount ?? defaultRetryCount;
    this.retryDelayMs = options.retryDelayMs ?? defaultRetryDelayMs;
  }

  async generateThumbnail(input: GenerateVideoThumbnailInput): Promise<VideoThumbnailSource | null> {
    logMediaDebug('thumbnail generation started', {
      uri: input.video.uri,
      fileName: input.video.fileName,
      mimeType: input.video.mimeType,
      timeSeconds: input.timeSeconds,
    });

    const player = await this.createPlayer(null);

    try {
      await player.replaceAsync({ uri: input.video.uri });
      const thumbnail = await this.generateFirstThumbnail(player, input.timeSeconds);

      logMediaDebug('thumbnail generation completed', {
        thumbnail: describeMediaSource(thumbnail),
      });

      return thumbnail;
    } finally {
      player.release();
      logMediaDebug('thumbnail player released');
    }
  }

  private async generateFirstThumbnail(
    player: ThumbnailPlayer,
    timeSeconds: number
  ): Promise<VideoThumbnailSource | null> {
    for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
      const thumbnails = await player.generateThumbnailsAsync([timeSeconds], {
        maxWidth: defaultMaxThumbnailWidth,
      });
      const thumbnail = thumbnails[0] ?? null;

      logMediaDebug('thumbnail generation attempt completed', {
        attempt,
        count: thumbnails.length,
        thumbnail: describeMediaSource(thumbnail),
      });

      if (thumbnail || attempt === this.retryCount) {
        return thumbnail;
      }

      await delay(this.retryDelayMs);
    }

    return null;
  }
}

export function createExpoVideoThumbnailGenerator(): ExpoVideoThumbnailGenerator {
  return new ExpoVideoThumbnailGenerator();
}

async function createExpoVideoPlayer(source: VideoSource): Promise<ThumbnailPlayer> {
  const { createVideoPlayer } = await import('expo-video');

  return createVideoPlayer(source) as ThumbnailPlayer;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
