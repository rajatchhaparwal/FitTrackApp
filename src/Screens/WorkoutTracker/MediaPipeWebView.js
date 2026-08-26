/**
 * MediaPipeWebView.js
 *
 * Self-contained WebView component that runs MediaPipe Pose (BlazePose) fully
 * inside a browser sandbox.  On every detected frame, poseLandmarks (array of
 * 33 {x,y,z,visibility} objects) are sent to RN via postMessage.
 *
 * Production settings:
 *   modelComplexity  = 1  (Full model — best accuracy/speed for production)
 *   smoothLandmarks  = true   (reduces per-frame angle jitter → fewer false reps)
 *   minDetectionConfidence = 0.6
 *   minTrackingConfidence  = 0.6
 *
 * Canvas draws the skeleton overlay directly in the WebView so no separate
 * RN overlay is needed.
 */

import React, { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Inline HTML blob ─────────────────────────────────────────────────────────
// Loaded via source={{ html }} so there is no network round-trip for the HTML
// itself.  MediaPipe JS libs are loaded from jsDelivr CDN (fast, globally
// cached).  The camera feed is NEVER sent across the bridge — only the 33
// landmark coordinates (~3 KB per frame) travel as JSON.
const MEDIAPIPE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #container { position: relative; width: 100%; height: 100%; }
    video { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover; transform: scaleX(-1); }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
             transform: scaleX(-1); }
    #status { position: absolute; bottom: 8px; left: 0; right: 0; text-align: center;
              color: rgba(255,255,255,0.5); font-size: 12px; font-family: sans-serif;
              pointer-events: none; }
  </style>
</head>
<body>
<div id="container">
  <video id="video" playsinline autoplay muted></video>
  <canvas id="canvas"></canvas>
  <div id="status">Initialising camera…</div>
</div>

<!-- MediaPipe CDN (jsDelivr mirrors are globally cached) -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js" crossorigin="anonymous"></script>

<script>
  const video  = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');
  const status = document.getElementById('status');

  // ── MediaPipe Pose ──────────────────────────────────────────────────────────
  const pose = new Pose({
    locateFile: (file) =>
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/' + file
  });

  pose.setOptions({
    modelComplexity: 1,          // Full model — production accuracy
    smoothLandmarks: true,       // Temporal smoothing → kills angle jitter
    enableSegmentation: false,   // Not needed, saves GPU
    smoothSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  // ── POSE_CONNECTIONS (same as @mediapipe/pose constant) ────────────────────
  const POSE_CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],
    [9,10],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],
    [12,14],[14,16],[16,18],[16,20],[16,22],[18,20],
    [11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],
    [27,29],[28,30],[29,31],[30,32],[27,31],[28,32]
  ];

  // ── Draw skeleton ───────────────────────────────────────────────────────────
  function drawSkeleton(landmarks) {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Connections
    ctx.strokeStyle = 'rgba(90,139,255,0.85)';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const [a, b] of POSE_CONNECTIONS) {
      const pa = landmarks[a];
      const pb = landmarks[b];
      if (!pa || !pb) continue;
      if ((pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x * W, pa.y * H);
      ctx.lineTo(pb.x * W, pb.y * H);
      ctx.stroke();
    }

    // Joints
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.arc(lm.x * W, lm.y * H, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,139,255,1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // ── Results callback ────────────────────────────────────────────────────────
  pose.onResults((results) => {
    // Resize canvas to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth  || 480;
      canvas.height = video.videoHeight || 640;
    }

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      drawSkeleton(results.poseLandmarks);
      status.textContent = '';

      // Send landmarks to React Native (only the 33 points — not image data)
      try {
        window.ReactNativeWebView.postMessage(
          JSON.stringify(results.poseLandmarks)
        );
      } catch (e) {
        // Bridge not ready yet — silently skip
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      status.textContent = 'No pose detected — step back so full body is visible';
    }
  });

  // ── Camera ──────────────────────────────────────────────────────────────────
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width:  { ideal: 480 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        canvas.width  = video.videoWidth  || 480;
        canvas.height = video.videoHeight || 640;
        status.textContent = 'Detecting pose…';
        processFrame();
      };
    } catch (err) {
      status.textContent = 'Camera error: ' + err.message;
      console.error('Camera error:', err);
    }
  }

  // ── Frame processing loop ───────────────────────────────────────────────────
  // Uses requestAnimationFrame — sends every frame to MediaPipe (no throttle).
  // smoothLandmarks on MediaPipe side handles temporal noise.
  let processing = false;
  async function processFrame() {
    if (!processing) {
      processing = true;
      try {
        await pose.send({ image: video });
      } catch (e) {
        // Model not ready yet
      }
      processing = false;
    }
    requestAnimationFrame(processFrame);
  }

  startCamera();
</script>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {function} onLandmarks - Called with MediaPipe poseLandmarks array
 *                                 (33 objects: {x, y, z, visibility})
 *                                 on every detected frame.
 * @param {boolean}  active      - When false, onLandmarks is not fired (paused).
 */
const MediaPipeWebView = ({ onLandmarks, active = true }) => {
  const webviewRef = useRef(null);

  const handleMessage = useCallback((event) => {
    if (!active) return;
    try {
      const landmarks = JSON.parse(event.nativeEvent.data);
      if (Array.isArray(landmarks) && landmarks.length === 33) {
        onLandmarks?.(landmarks);
      }
    } catch {
      // Malformed message — ignore
    }
  }, [active, onLandmarks]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: MEDIAPIPE_HTML, baseUrl: 'https://localhost' }}
        style={styles.webview}
        originWhitelist={['*']}
        // Camera access
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        // Android permissions — required for getUserMedia to work
        allowsProtectedMedia
        allowFileAccess
        geolocationEnabled
        mixedContentMode="always"
        // Performance
        javaScriptEnabled
        domStorageEnabled
        // Message bridge
        onMessage={handleMessage}
        // Error states
        onError={(e) => console.warn('MediaPipeWebView error:', e.nativeEvent)}
        onHttpError={(e) => console.warn('MediaPipeWebView HTTP error:', e.nativeEvent)}
        // Suppress console log leakage in prod
        onContentProcessDidTerminate={() => webviewRef.current?.reload()}
        // Do NOT show loading spinner — video feed replaces it
        startInLoadingState={false}
        // Needed for getUserMedia on Android
        androidLayerType="hardware"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default MediaPipeWebView;
