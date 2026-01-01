import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SessionCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    checkpoints,
    currentSettings,
    tvModel,
    completeSession,
    resetSession,
  } = useCalibrationStore();

  const [satisfaction, setSatisfaction] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  // Get original and final settings for comparison
  const originalCheckpoint = checkpoints[0];
  const currentCheckpoint = checkpoints[checkpoints.length - 1];

  const handleRating = (rating: 1 | 2 | 3 | 4 | 5) => {
    setSatisfaction(rating);
  };

  const handleComplete = () => {
    if (satisfaction) {
      completeSession(satisfaction);
      // TODO: Save to Supabase
    }
  };

  const handleDone = () => {
    resetSession();
    navigation.navigate('Main');
  };

  const handleContinue = () => {
    // TODO: Navigate to next pattern (contrast, color, etc.)
    navigation.navigate('PatternDisplay', { patternSlug: 'white-clipping' });
  };

  // Calculate what changed
  const getSettingsChanges = () => {
    if (!originalCheckpoint) return [];

    const changes: Array<{
      setting: string;
      from: string | number;
      to: string | number;
    }> = [];

    Object.entries(currentSettings).forEach(([key, value]) => {
      const originalValue = originalCheckpoint.settings[key];
      if (originalValue !== undefined && originalValue !== value) {
        changes.push({
          setting: key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          from: originalValue,
          to: value as string | number,
        });
      }
    });

    return changes;
  };

  const changes = getSettingsChanges();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.header}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.title}>Calibration Complete!</Text>
          <Text style={styles.subtitle}>
            Your {tvModel?.displayName || 'TV'} picture settings have been optimized
          </Text>
        </View>

        {/* Changes Summary */}
        {changes.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>What Changed</Text>

            {changes.map((change, index) => (
              <View key={index} style={styles.changeRow}>
                <Text style={styles.changeSetting}>{change.setting}</Text>
                <View style={styles.changeValues}>
                  <Text style={styles.changeFrom}>{change.from}</Text>
                  <Text style={styles.changeArrow}>→</Text>
                  <Text style={styles.changeTo}>{change.to}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Iterations Summary */}
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{checkpoints.length}</Text>
            <Text style={styles.statLabel}>Checkpoints</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{changes.length}</Text>
            <Text style={styles.statLabel}>Settings Changed</Text>
          </View>
        </View>

        {/* Satisfaction Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How satisfied are you?</Text>
          <Text style={styles.ratingSubtitle}>
            Your feedback helps us improve recommendations
          </Text>

          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  satisfaction === rating && styles.ratingButtonSelected,
                ]}
                onPress={() => handleRating(rating as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={styles.ratingEmoji}>
                  {rating === 1 && '😞'}
                  {rating === 2 && '😕'}
                  {rating === 3 && '😐'}
                  {rating === 4 && '🙂'}
                  {rating === 5 && '😍'}
                </Text>
                <Text
                  style={[
                    styles.ratingLabel,
                    satisfaction === rating && styles.ratingLabelSelected,
                  ]}
                >
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crowd Contribution Note */}
        <View style={styles.contributionCard}>
          <Text style={styles.contributionIcon}>🤝</Text>
          <Text style={styles.contributionText}>
            Your calibration data will help other{' '}
            {tvModel?.displayName || 'TV'} owners get better recommendations!
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {satisfaction && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>
                  Continue to Contrast Calibration
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleDone}
              >
                <Text style={styles.secondaryButtonText}>
                  I'm done for now
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!satisfaction && (
            <Text style={styles.ratingPrompt}>
              Please rate your experience to continue
            </Text>
          )}
        </View>

        {/* History Link */}
        <TouchableOpacity
          style={styles.historyLink}
          onPress={() => navigation.navigate('CheckpointHistory')}
        >
          <Text style={styles.historyLinkText}>
            View full settings history
          </Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  changeSetting: {
    fontSize: 14,
    color: '#888',
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeFrom: {
    fontSize: 16,
    color: '#666',
  },
  changeArrow: {
    fontSize: 14,
    color: '#6c63ff',
    marginHorizontal: 8,
  },
  changeTo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c63ff',
  },
  statsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6c63ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a2a4e',
    marginHorizontal: 16,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  ratingButton: {
    width: 56,
    height: 72,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2a4e',
  },
  ratingButtonSelected: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  ratingEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#888',
  },
  ratingLabelSelected: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  contributionCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  contributionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contributionText: {
    flex: 1,
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
  },
  ratingPrompt: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  historyLink: {
    padding: 12,
    alignItems: 'center',
  },
  historyLinkText: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'underline',
  },
});
