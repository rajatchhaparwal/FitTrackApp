import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { usePoseDetection } from './hooks/usePoseDetection'; // Ensure correct path

const PoseDetectionComponent = () => {
  // 1. Get the device correctly (usually back camera for fitness tracking)
  const device = useCameraDevice('front');

  // 2. Memoize callbacks to prevent unnecessary re-renders of the hook
  const callbacks = useMemo(() => ({
    onResults: (results) => {
      // Logic for FitTrack (e.g., counting squats or checking form)
      // console.log('Landmarks:', results.landmarks); 
    },
    onError: (error) => {
      console.error('Pose detection error:', error);
    },
  }), []);

  // 3. Initialize the hook
  const { frameProcessor, fpsMode } = usePoseDetection(
    callbacks, 
    'LIVE_STREAM', 
    'pose_landmarker_full.task', // Use the actual model filename
    {
      minPoseDetectionConfidence: 0.7, // Higher confidence for better tracking
      delegate: 'GPU',
    }
  );

  if (device == null) return <Text>No Camera Found</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="yuv" // Required for many frame processors (especially on Android)
        frameProcessor={frameProcessor}
        fps={fpsMode} 
      />
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