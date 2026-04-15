import { useMemo } from 'react';
import { usePoseLandmarker } from 'react-native-mediapipe';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

/**
 * usePoseDetection
 *
 * @param {object}   callbacks  - { onResults, onError }
 * @param {string}   runningMode - 'LIVE_STREAM' | 'IMAGE' | 'VIDEO'
 * @param {string}   modelAsset  - filename of the .task model asset
 * @param {object}   options     - { minPoseDetectionConfidence, delegate, ... }
 * @returns {{ frameProcessor, fpsMode }}
 */
export function usePoseDetection(callbacks, runningMode, modelAsset, options = {}) {
  const {
    minPoseDetectionConfidence = 0.5,
    delegate = 'GPU',
  } = options;

  // Build the mediapipe pose landmarker
  const poseLandmarker = usePoseLandmarker(
    modelAsset,
    runningMode,
    callbacks,
    {
      minPoseDetectionConfidence,
      delegate,
    },
  );

  // Wrap JS callbacks so they can be called from the worklet thread
  const onResultsJS = Worklets.createRunInJsFn((results) => {
    if (callbacks.onResults) {
      callbacks.onResults(results);
    }
  });

  const onErrorJS = Worklets.createRunInJsFn((error) => {
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (poseLandmarker) {
        poseLandmarker.detectForVideo(frame, Date.now());
      }
    },
    [poseLandmarker],
  );

  // Use 30fps for LIVE_STREAM mode to keep the device cool
  const fpsMode = useMemo(() => (runningMode === 'LIVE_STREAM' ? 30 : 15), [runningMode]);

  return { frameProcessor, fpsMode };
}
