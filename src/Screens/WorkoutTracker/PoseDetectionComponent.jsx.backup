import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MediapipeCamera } from 'react-native-mediapipe';
import { usePoseDetection, POSE_MODEL } from './hooks/usePoseDetection';

const PoseDetectionComponent = ({ onPoseResults }) => {
  const callbacks = useMemo(
    () => ({
      onResults: (results) => {
        if (onPoseResults) onPoseResults(results);
      },
      onError: (error) => {
        console.error('Pose detection error:', error);
      },
    }),
    [onPoseResults],
  );

  const solution = usePoseDetection(callbacks, 'LIVE_STREAM', POSE_MODEL, {
    minPoseDetectionConfidence: 0.7,
    delegate: 'GPU',
    fpsMode: 30,
  });

  return (
    <View style={styles.container}>
      <MediapipeCamera style={StyleSheet.absoluteFill} solution={solution} activeCamera="front" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default PoseDetectionComponent;
