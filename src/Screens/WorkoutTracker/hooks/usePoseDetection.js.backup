import { useMemo } from 'react';
import {
  usePoseDetection as useMediaPipePose,
  RunningMode,
  Delegate,
} from 'react-native-mediapipe';

export const POSE_MODEL = 'pose_landmarker_lite.task';

const RUNNING_MODE_MAP = {
  LIVE_STREAM: RunningMode.LIVE_STREAM,
  IMAGE: RunningMode.IMAGE,
  VIDEO: RunningMode.VIDEO,
};

/**
 * Wraps react-native-mediapipe pose detection for FitTrack.
 * Returns the full MediaPipeSolution (frameProcessor + camera handlers).
 */
export function usePoseDetection(callbacks, runningMode = 'LIVE_STREAM', modelAsset = POSE_MODEL, options = {}) {
  const {
    minPoseDetectionConfidence = 0.5,
    minPosePresenceConfidence = 0.5,
    minTrackingConfidence = 0.5,
    delegate = 'GPU',
    fpsMode = 30,
  } = options;

  const mode = RUNNING_MODE_MAP[runningMode] ?? RunningMode.LIVE_STREAM;

  const solution = useMediaPipePose(
    callbacks,
    mode,
    modelAsset,
    useMemo(
      () => ({
        minPoseDetectionConfidence,
        minPosePresenceConfidence,
        minTrackingConfidence,
        delegate: delegate === 'GPU' ? Delegate.GPU : Delegate.CPU,
        fpsMode,
        numPoses: 1,
      }),
      [
        minPoseDetectionConfidence,
        minPosePresenceConfidence,
        minTrackingConfidence,
        delegate,
        fpsMode,
      ],
    ),
  );

  return solution;
}
