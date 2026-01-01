import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraType } from 'expo-camera';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
  patternName?: string;
}

export default function CameraCapture({
  onCapture,
  onCancel,
  patternName,
}: CameraCaptureProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          CrowdTuner needs camera access to capture the test pattern on your TV
          screen for analysis.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true, // Disable HDR/processing for accurate capture
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  // Show captured image preview
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />

          {/* Overlay with tips */}
          <View style={styles.previewOverlay}>
            <Text style={styles.previewTitle}>Review Your Capture</Text>
            <View style={styles.checklistContainer}>
              <Text style={styles.checklistItem}>✓ Pattern clearly visible?</Text>
              <Text style={styles.checklistItem}>✓ No major reflections?</Text>
              <Text style={styles.checklistItem}>✓ Image in focus?</Text>
            </View>
          </View>
        </View>

        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePhotoButton} onPress={handleUsePhoto}>
            <Text style={styles.usePhotoButtonText}>Use This Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Guidance overlay */}
        <View style={styles.overlay}>
          {/* Top guidance */}
          <View style={styles.topGuidance}>
            {patternName && (
              <View style={styles.patternBadge}>
                <Text style={styles.patternBadgeText}>
                  Capturing: {patternName}
                </Text>
              </View>
            )}
          </View>

          {/* Alignment frame */}
          <View style={styles.alignmentFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <Text style={styles.alignmentText}>
              Align TV screen within frame
            </Text>
          </View>

          {/* Bottom tips */}
          <View style={styles.bottomGuidance}>
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>📍 Stand 4-6 feet away</Text>
              <Text style={styles.tipText}>📱 Hold phone level</Text>
              <Text style={styles.tipText}>💡 Dim room lights if possible</Text>
            </View>
          </View>
        </View>
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelCameraButton} onPress={onCancel}>
          <Text style={styles.cancelCameraButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
        >
          <Text style={styles.flipButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topGuidance: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  patternBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  patternBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alignmentFrame: {
    marginHorizontal: 30,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6c63ff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  alignmentText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomGuidance: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0f0f1a',
  },
  cancelCameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCameraButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },
  // Preview screen
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  checklistContainer: {
    gap: 8,
  },
  checklistItem: {
    color: '#6c63ff',
    fontSize: 14,
  },
  previewControls: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    backgroundColor: '#0f0f1a',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  usePhotoButton: {
    flex: 2,
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  usePhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
