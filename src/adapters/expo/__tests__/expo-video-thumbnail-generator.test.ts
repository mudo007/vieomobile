import { ExpoVideoThumbnailGenerator } from '@/src/adapters/expo';

const selectedVideo = {
  uri: 'file:///creator/video.mov',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
};

describe('ExpoVideoThumbnailGenerator', () => {
  it('generates one thumbnail from the selected video and releases the player', async () => {
    // Given
    const thumbnail = { requestedTime: 1, width: 960, height: 540 };
    const player = {
      replaceAsync: jest.fn().mockResolvedValue(undefined),
      generateThumbnailsAsync: jest.fn().mockResolvedValue([thumbnail]),
      release: jest.fn(),
    };
    const createPlayer = jest.fn().mockReturnValue(player);
    const generator = new ExpoVideoThumbnailGenerator(createPlayer);

    // When
    const generatedThumbnail = await generator.generateThumbnail({
      video: selectedVideo,
      timeSeconds: 1,
    });

    // Then
    expect(createPlayer).toHaveBeenCalledWith(null);
    expect(player.replaceAsync).toHaveBeenCalledWith({ uri: 'file:///creator/video.mov' });
    expect(player.generateThumbnailsAsync).toHaveBeenCalledWith([1], {
      maxWidth: 960,
    });
    expect(player.release).toHaveBeenCalledTimes(1);
    expect(generatedThumbnail).toBe(thumbnail);
  });

  it('releases the player when thumbnail generation fails', async () => {
    // Given
    const player = {
      replaceAsync: jest.fn().mockResolvedValue(undefined),
      generateThumbnailsAsync: jest.fn().mockRejectedValue(new Error('Native thumbnail failure.')),
      release: jest.fn(),
    };
    const createPlayer = jest.fn().mockReturnValue(player);
    const generator = new ExpoVideoThumbnailGenerator(createPlayer);

    // When / Then
    await expect(
      generator.generateThumbnail({
        video: selectedVideo,
        timeSeconds: 1,
      })
    ).rejects.toThrow('Native thumbnail failure.');
    expect(player.release).toHaveBeenCalledTimes(1);
  });

  it('retries when the player has not attached the current item yet', async () => {
    // Given
    const thumbnail = { requestedTime: 1, width: 960, height: 540 };
    const player = {
      replaceAsync: jest.fn().mockResolvedValue(undefined),
      generateThumbnailsAsync: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([thumbnail]),
      release: jest.fn(),
    };
    const createPlayer = jest.fn().mockReturnValue(player);
    const generator = new ExpoVideoThumbnailGenerator(createPlayer, { retryDelayMs: 0 });

    // When
    const generatedThumbnail = await generator.generateThumbnail({
      video: selectedVideo,
      timeSeconds: 1,
    });

    // Then
    expect(player.generateThumbnailsAsync).toHaveBeenCalledTimes(2);
    expect(generatedThumbnail).toBe(thumbnail);
  });
});
