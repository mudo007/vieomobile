import { useReducer } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  initialCreatorUploadState,
  reduceCreatorUpload,
  type CreatorUploadEvent,
  type CreatorUploadState,
} from '@/src/domain/creator';
import { pickCreatorVideo, type VideoPickerPort } from '@/src/use-cases/creator';

export type CreatorUploadScreenProps = {
  videoPicker: VideoPickerPort;
  initialState?: CreatorUploadState;
  onExitFlow?: () => void;
};

export function CreatorUploadScreen({
  videoPicker,
  initialState,
  onExitFlow,
}: CreatorUploadScreenProps) {
  const [state, dispatch] = useReducer(
    reduceCreatorUpload,
    initialState ?? initialCreatorUploadState
  );

  const handleCreateUpload = async () => {
    const pickingState: CreatorUploadState = { status: 'picking' };
    dispatch({ type: 'startPicking' });

    const event = await pickCreatorVideo(pickingState, { videoPicker });

    if (event) {
      dispatch(event);

      if (event.type === 'cancelPicking') {
        onExitFlow?.();
      }
    }
  };

  const handleDispatch = (event: CreatorUploadEvent) => {
    dispatch(event);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creator</Text>
      {renderCreatorUploadState(state, handleCreateUpload, handleDispatch, onExitFlow)}
    </View>
  );
}

function renderCreatorUploadState(
  state: CreatorUploadState,
  onCreateUpload: () => void,
  dispatch: (event: CreatorUploadEvent) => void,
  onExitFlow: (() => void) | undefined
) {
  switch (state.status) {
    case 'idle':
      return (
        <View style={styles.section}>
          <Pressable
            accessibilityRole="button"
            onPress={onCreateUpload}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create upload</Text>
          </Pressable>
          {onExitFlow ? (
            <Pressable
              accessibilityRole="button"
              onPress={onExitFlow}
              style={styles.secondaryButton}>
              <Text>Back home</Text>
            </Pressable>
          ) : null}
        </View>
      );

    case 'picking':
      return <Text>Picking video...</Text>;

    case 'editing':
      return (
        <View style={styles.section}>
          <Text>{getVideoLabel(state.video.fileName)}</Text>
          <TextInput
            placeholder="Video title"
            value={state.title}
            onChangeText={(title) => dispatch({ type: 'changeTitle', title })}
            style={styles.input}
          />
          {state.titleError ? <Text style={styles.errorText}>{state.titleError.message}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'confirmUpload' })}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Confirm upload</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'cancelEditing' })}
            style={styles.secondaryButton}>
            <Text>Cancel editing</Text>
          </Pressable>
        </View>
      );

    case 'uploading':
      return (
        <View style={styles.section}>
          <Text>Uploading {state.title}</Text>
          <Text>Progress: {Math.round(state.progress * 100)}%</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'cancelUpload' })}
            style={styles.secondaryButton}>
            <Text>Cancel upload</Text>
          </Pressable>
        </View>
      );

    case 'uploaded':
      return (
        <View style={styles.section}>
          <Text>Upload complete</Text>
          <Text>{state.uploadedVideo.title}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'reset' })}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create another</Text>
          </Pressable>
        </View>
      );

    case 'failed':
      return (
        <View style={styles.section}>
          <Text style={styles.errorText}>{state.failure.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'reset' })}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
  }
}

function getVideoLabel(fileName: string | undefined): string {
  return fileName ?? 'Selected video';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#b42318',
  },
});
