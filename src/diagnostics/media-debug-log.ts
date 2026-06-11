type RuntimeGlobals = typeof globalThis & {
  process?: {
    env?: {
      NODE_ENV?: string;
      EXPO_PUBLIC_MEDIA_DEBUG?: string;
    };
  };
};

type ThumbnailLike = {
  constructor?: {
    name?: string;
  };
  width?: unknown;
  height?: unknown;
  requestedTime?: unknown;
  actualTime?: unknown;
};

export function logMediaDebug(message: string, metadata?: Record<string, unknown>): void {
  const runtime = globalThis as RuntimeGlobals;

  if (
    runtime.process?.env?.NODE_ENV === 'test' ||
    runtime.process?.env?.EXPO_PUBLIC_MEDIA_DEBUG !== 'true'
  ) {
    return;
  }

  if (metadata) {
    console.info(`[VideoShare media] ${message}`, metadata);
    return;
  }

  console.info(`[VideoShare media] ${message}`);
}

export function describeMediaSource(source: unknown): Record<string, unknown> {
  if (!source) {
    return { kind: 'none' };
  }

  if (typeof source === 'string') {
    return {
      kind: 'uri',
      uri: source,
    };
  }

  if (typeof source !== 'object') {
    return {
      kind: typeof source,
    };
  }

  const thumbnail = source as ThumbnailLike;

  return {
    kind: 'native-image-ref',
    constructorName: thumbnail.constructor?.name,
    keys: Object.keys(source),
    width: thumbnail.width,
    height: thumbnail.height,
    requestedTime: thumbnail.requestedTime,
    actualTime: thumbnail.actualTime,
  };
}
