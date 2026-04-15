import React, { useEffect, useState } from 'react';
import { Camera } from 'react-native-vision-camera';
import PoseDetectionComponent from './PoseDetectionComponent';
import { View, Text, ActivityIndicator } from 'react-native';

const FitTrackCameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  
  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Camera permission is required for AI tracking.</Text>
      </View>
    );
  }

  return <PoseDetectionComponent />;
};

export default FitTrackCameraScreen;