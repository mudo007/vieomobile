import { useEffect, useReducer, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  initialCreatorUploadState,
  reduceCreatorUpload,
  type CreatorUploadEvent,
  type CreatorUploadState,
} from '@/src/domain/creator';
import {
  pickCreatorVideo,
  type VideoPickerPort,
  type VideoUploaderPort,
} from '@/src/use-cases/creator';
import { AppColors, AppRadii, AppShadow, AppSpacing } from '@/src/presentation/shared/app-design';
import { useCreatorUpload } from './use-creator-upload';

export type CreatorUploadScreenProps = {
  videoPicker: VideoPickerPort;
  videoUploader: VideoUploaderPort;
  initialState?: CreatorUploadState;
  onExitFlow?: () => void;
};

export function CreatorUploadScreen({
  videoPicker,
  videoUploader,
  initialState,
  onExitFlow,
}: CreatorUploadScreenProps) {
  const [state, dispatch] = useReducer(
    reduceCreatorUpload,
    initialState ?? initialCreatorUploadState
  );
  const previousStatus = useRef(state.status);

  useCreatorUpload({
    state,
    videoUploader,
    dispatch,
  });

  useEffect(() => {
    const transitionedToIdle = previousStatus.current !== 'idle' && state.status === 'idle';

    previousStatus.current = state.status;

    if (transitionedToIdle) {
      onExitFlow?.();
    }
  }, [onExitFlow, state.status]);

  const handlePickVideo = async () => {
    if (state.status !== 'picking') {
      return;
    }

    const event = await pickCreatorVideo(state, { videoPicker });

    if (event) {
      dispatch(event);
    }
  };

  const handleDispatch = (event: CreatorUploadEvent) => {
    dispatch(event);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.brand}>VideoShare</Text>
          <View style={styles.headerActions}>
            <View style={styles.navPill}>
              <Text style={styles.navPillText}>▣ Feed</Text>
            </View>
            <View style={[styles.navPill, styles.navPillActive]}>
              <Text style={styles.navPillActiveText}>↥ Upload</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {renderCreatorUploadState(state, handlePickVideo, handleDispatch, onExitFlow)}
      </ScrollView>
    </View>
  );
}

function renderCreatorUploadState(
  state: CreatorUploadState,
  onPickVideo: () => void,
  dispatch: (event: CreatorUploadEvent) => void,
  onExitFlow: (() => void) | undefined
) {
  switch (state.status) {
    case 'idle':
      return null;

    case 'picking':
      return (
        <View style={styles.uploadCard}>
          <Text style={styles.formTitle}>Upload Video</Text>
          <Text style={styles.mutedText}>
            Select a video first. You will add the title and description after the file is chosen.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Video File</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onPickVideo}
              style={styles.fileDropzone}>
              <Text style={styles.uploadIcon}>↥</Text>
              <Text style={styles.dropzoneText}>Click to upload or drag and drop</Text>
              <Text style={styles.dropzoneMeta}>MP4, MOV, AVI (MAX. 500MB)</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={onPickVideo} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create upload</Text>
          </Pressable>
          {onExitFlow ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => dispatch({ type: 'cancelPicking' })}
              style={styles.secondaryButton}>
              <Text>Back home</Text>
            </Pressable>
          ) : null}
        </View>
      );

    case 'editing':
      return (
        <View style={styles.uploadCard}>
          <Text style={styles.formTitle}>Upload Video</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Video Title</Text>
            <TextInput
              placeholder="Video title"
              placeholderTextColor="#8a94a6"
              value={state.title}
              onChangeText={(title) => dispatch({ type: 'changeTitle', title })}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              multiline
              placeholder="Add a description..."
              placeholderTextColor="#8a94a6"
              value={state.description}
              onChangeText={(description) => dispatch({ type: 'changeDescription', description })}
              style={[styles.input, styles.textArea]}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Video File</Text>
            <View style={styles.selectedFile}>
              <Text style={styles.selectedFileName}>{getVideoLabel(state.video.fileName)}</Text>
              <Text style={styles.dropzoneMeta}>{state.video.mimeType ?? 'Selected video file'}</Text>
            </View>
          </View>
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
        <View style={styles.uploadCard}>
          <Text style={styles.formTitle}>Uploading {state.title}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(state.progress * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>Progress: {Math.round(state.progress * 100)}%</Text>
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
        <View style={styles.uploadCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.formTitle}>Upload complete</Text>
          <Text style={styles.mutedText}>{state.uploadedVideo.title}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'reset' })}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back home</Text>
          </Pressable>
        </View>
      );

    case 'failed':
      return (
        <View style={styles.uploadCard}>
          <Text style={styles.formTitle}>Upload failed</Text>
          <Text style={styles.errorText}>{state.failure.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'reset' })}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back home</Text>
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
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppSpacing.md,
    paddingBottom: AppSpacing.sm,
    paddingTop: AppSpacing.sm,
  },
  headerSafeArea: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.softBorder,
    backgroundColor: AppColors.surface,
  },
  brand: {
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: AppSpacing.xs,
  },
  navPill: {
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.mutedSurface,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  navPillActive: {
    backgroundColor: AppColors.primary,
  },
  navPillText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  navPillActiveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppSpacing.lg,
  },
  uploadCard: {
    gap: AppSpacing.lg,
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface,
    padding: AppSpacing.lg,
    ...AppShadow,
  },
  formTitle: {
    color: AppColors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  field: {
    gap: AppSpacing.sm,
  },
  label: {
    color: AppColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: AppRadii.sm,
    color: AppColors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 94,
    textAlignVertical: 'top',
  },
  fileDropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.border,
    borderRadius: AppRadii.sm,
    padding: AppSpacing.lg,
  },
  uploadIcon: {
    color: '#98a2b3',
    fontSize: 42,
    fontWeight: '700',
  },
  dropzoneText: {
    color: AppColors.mutedText,
    fontWeight: '700',
    textAlign: 'center',
  },
  dropzoneMeta: {
    color: AppColors.mutedText,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedFile: {
    gap: AppSpacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.border,
    borderRadius: AppRadii.sm,
    padding: AppSpacing.md,
  },
  selectedFileName: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  mutedText: {
    color: AppColors.mutedText,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 12,
  },
  progressTrack: {
    height: 12,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: AppColors.mutedSurface,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: AppColors.primary,
  },
  progressText: {
    color: AppColors.mutedText,
    fontWeight: '700',
  },
  successIcon: {
    color: AppColors.primary,
    fontSize: 40,
    fontWeight: '800',
  },
  errorText: {
    color: AppColors.danger,
    fontWeight: '700',
  },
});
