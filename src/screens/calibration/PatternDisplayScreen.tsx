import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PatternDisplay'>;

// Web patterns URL (GitHub Pages)
const WEB_PATTERNS_URL = 'https://rhicks7gatech.github.io/CrowdTuner';

// Pattern info with YouTube search terms
// YouTube video IDs will be added once you upload the videos
const PATTERNS: Record<string, {
  name: string;
  slug: string;
  description: string;
  instruction: string;
  previewIcon: string;
  youtubeSearch: string;
  youtubeVideoId?: string; // Add your video IDs here after uploading
}> = {
  'black-level': {
    name: 'Black Level (PLUGE)',
    slug: 'pluge',
    description: 'This pattern tests if your Brightness setting is correct.',
    instruction: 'Adjust Brightness until you can just barely see the darkest bars.',
    previewIcon: '🌑',
    youtubeSearch: 'TV brightness calibration PLUGE pattern',
    // youtubeVideoId: 'YOUR_VIDEO_ID', // Add after uploading
  },
  'white-clipping': {
    name: 'Contrast Test',
    slug: 'contrast',
    description: 'This pattern tests if your Contrast setting is correct.',
    instruction: 'Adjust Contrast until you can see all the white steps distinctly.',
    previewIcon: '☀️',
    youtubeSearch: 'TV contrast calibration white clipping test',
  },
  'color-bars': {
    name: 'Color Bars (SMPTE)',
    slug: 'colorbars',
    description: 'Industry-standard pattern for color accuracy calibration.',
    instruction: 'Adjust Color/Saturation so colors look vivid but natural.',
    previewIcon: '🌈',
    youtubeSearch: 'SMPTE color bars TV calibration',
  },
  'grayscale': {
    name: 'Grayscale Ramp',
    slug: 'grayscale',
    description: 'Check for smooth transitions and color tinting.',
    instruction: 'Each bar should be neutral gray with no color tint.',
    previewIcon: '⬜',
    youtubeSearch: 'TV grayscale calibration pattern',
  },
  'sharpness': {
    name: 'Sharpness Test',
    slug: 'sharpness',
    description: 'Fine-tune sharpness to avoid artificial edge enhancement.',
    instruction: 'Adjust Sharpness until lines are crisp without white halos.',
    previewIcon: '🔲',
    youtubeSearch: 'TV sharpness calibration test pattern',
  },
};

export default function PatternDisplayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { setCurrentPattern } = useCalibrationStore();

  const { patternSlug } = route.params;
  const pattern = PATTERNS[patternSlug];

  const [showWebOption, setShowWebOption] = useState(false);

  if (!pattern) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Pattern not found</Text>
      </SafeAreaView>
    );
  }

  const webPatternUrl = `${WEB_PATTERNS_URL}#${pattern.slug}`;

  // Open YouTube - either direct to video or search
  const handleOpenYouTube = () => {
    if (pattern.youtubeVideoId) {
      // Direct link to your uploaded video
      Linking.openURL(`https://www.youtube.com/watch?v=${pattern.youtubeVideoId}`);
    } else {
      // Search for the pattern
      const searchQuery = encodeURIComponent(pattern.youtubeSearch);
      Linking.openURL(`https://www.youtube.com/results?search_query=${searchQuery}`);
    }
  };

  const handleOpenWeb = () => {
    Linking.openURL(webPatternUrl);
  };

  const handleShare = async () => {
    const message = pattern.youtubeVideoId
      ? `Watch this calibration pattern on your TV:\n\nhttps://www.youtube.com/watch?v=${pattern.youtubeVideoId}`
      : `Search for "${pattern.youtubeSearch}" on YouTube, or open:\n\n${webPatternUrl}`;

    try {
      await Share.share({
        message,
        title: `CrowdTuner - ${pattern.name}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handlePatternReady = () => {
    setCurrentPattern(patternSlug);
    navigation.navigate('Capture', { patternSlug });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Pattern Info */}
        <View style={styles.patternHeader}>
          <Text style={styles.patternIcon}>{pattern.previewIcon}</Text>
          <Text style={styles.patternName}>{pattern.name}</Text>
          <Text style={styles.patternDescription}>{pattern.description}</Text>
        </View>

        {/* YouTube - Primary Method */}
        <View style={styles.instructionsCard}>
          <View style={styles.methodHeader}>
            <Text style={styles.youtubeIcon}>▶️</Text>
            <Text style={styles.instructionsTitle}>Display via YouTube</Text>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Easiest</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Open YouTube on your TV</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Search for:</Text>
              <View style={styles.searchBox}>
                <Text style={styles.searchText}>{pattern.youtubeSearch}</Text>
              </View>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Play fullscreen and pause</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.youtubeButton} onPress={handleOpenYouTube}>
            <Text style={styles.youtubeButtonText}>Open YouTube Search</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenWeb}>
            <Text style={styles.actionIcon}>🌐</Text>
            <Text style={styles.actionText}>Web Pattern</Text>
          </TouchableOpacity>
        </View>

        {/* Web Option for Precision */}
        <TouchableOpacity
          style={styles.alternativesToggle}
          onPress={() => setShowWebOption(!showWebOption)}
        >
          <Text style={styles.alternativesToggleText}>
            {showWebOption ? '▼' : '▶'} Need pixel-perfect accuracy?
          </Text>
        </TouchableOpacity>

        {showWebOption && (
          <View style={styles.alternativesSection}>
            <Text style={styles.webOptionTitle}>Use Web Patterns</Text>
            <Text style={styles.webOptionDesc}>
              YouTube compression may affect fine details. For maximum precision
              (especially sharpness tests), use our web-based patterns.
            </Text>

            <View style={styles.webSteps}>
              <Text style={styles.webStep}>1. Open TV browser to: <Text style={styles.webUrl}>crowdtuner.app/patterns</Text></Text>
              <Text style={styles.webStep}>2. Select "{pattern.name}"</Text>
              <Text style={styles.webStep}>3. Press any key to go fullscreen</Text>
            </View>

            <TouchableOpacity style={styles.webButton} onPress={handleOpenWeb}>
              <Text style={styles.webButtonText}>Open Web Pattern</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* What to look for */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>What to adjust</Text>
          <Text style={styles.tipText}>{pattern.instruction}</Text>
        </View>

        {/* Confirmation Button */}
        <View style={styles.confirmSection}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handlePatternReady}
          >
            <Text style={styles.confirmButtonText}>
              Pattern is on my TV - Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.skipButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  patternHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  patternIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  patternName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  patternDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  youtubeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  recommendedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 4,
  },
  searchBox: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
  },
  youtubeButton: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  alternativesToggle: {
    padding: 12,
    marginBottom: 8,
  },
  alternativesToggleText: {
    fontSize: 14,
    color: '#888',
  },
  alternativesSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  webOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  webOptionDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  webSteps: {
    marginBottom: 16,
  },
  webStep: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  webUrl: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  webButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  webButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#6c63ff',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c63ff',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  confirmSection: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
  },
});
