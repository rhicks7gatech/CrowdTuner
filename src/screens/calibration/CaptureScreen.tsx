import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import CameraCapture from '../../components/camera/CameraCapture';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Capture'>;

// Pattern names for display
const PATTERN_NAMES: Record<string, string> = {
  'black-level': 'Black Level (PLUGE)',
  'white-clipping': 'Contrast Test',
  'color-bars': 'Color Bars',
  'grayscale': 'Grayscale Ramp',
  'sharpness': 'Sharpness Test',
};

export default function CaptureScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { checkpoints } = useCalibrationStore();

  const { patternSlug } = route.params;
  const patternName = PATTERN_NAMES[patternSlug] || 'Test Pattern';

  const [showCamera, setShowCamera] = useState(true);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  const iterationNumber = checkpoints.length;

  const handleCapture = (uri: string) => {
    setCapturedImageUri(uri);
    setShowCamera(false);
  };

  const handleRetake = () => {
    setCapturedImageUri(null);
    setShowCamera(true);
  };

  const handleUsePhoto = () => {
    // Navigate to results with the captured image
    // In production, we'd pass the image URI or upload it first
    navigation.navigate('Results', { patternSlug });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Show camera
  if (showCamera && !capturedImageUri) {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onCancel={handleCancel}
        patternName={patternName}
      />
    );
  }

  // Show captured image review
  return (
    <SafeAreaView style={styles.container}>
      {/* Captured Image */}
      <View style={styles.imageContainer}>
        {capturedImageUri ? (
          <Image source={{ uri: capturedImageUri }} style={styles.capturedImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image captured</Text>
          </View>
        )}

        {/* Overlay info */}
        <View style={styles.imageOverlay}>
          <View style={styles.iterationBadge}>
            <Text style={styles.iterationText}>
              Iteration {iterationNumber}
              {iterationNumber === 1 ? ' (Initial)' : ' (Verification)'}
            </Text>
          </View>
        </View>
      </View>

      {/* Review Section */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Review Your Capture</Text>
        <Text style={styles.reviewSubtitle}>
          Make sure the pattern is clearly visible
        </Text>

        <View style={styles.checklist}>
          <Text style={styles.checklistItem}>✓ TV screen fills most of the frame</Text>
          <Text style={styles.checklistItem}>✓ No major reflections or glare</Text>
          <Text style={styles.checklistItem}>✓ Image is in focus</Text>
          <Text style={styles.checklistItem}>✓ Pattern elements are visible</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeButtonText}>📷 Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.usePhotoButton} onPress={handleUsePhoto}>
          <Text style={styles.usePhotoButtonText}>Analyze This Photo</Text>
        </TouchableOpacity>
      </View>

      {/* History Link */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('CheckpointHistory')}
      >
        <Text style={styles.historyButtonText}>
          View Settings History ({checkpoints.length} checkpoints)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  capturedImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  iterationBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  iterationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewSection: {
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  checklist: {
    gap: 8,
  },
  checklistItem: {
    fontSize: 14,
    color: '#6c63ff',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
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
  historyButton: {
    padding: 16,
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 14,
    color: '#888',
  },
});
