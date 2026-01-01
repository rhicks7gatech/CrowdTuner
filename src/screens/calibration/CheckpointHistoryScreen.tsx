import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import type { Checkpoint, Settings } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  isActive: boolean;
  onRestore: () => void;
}

const formatSettings = (settings: Settings): string => {
  const entries = Object.entries(settings)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // Format key nicely
      const formattedKey = key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedKey}: ${value}`;
    });
  return entries.join(' • ');
};

const CheckpointCard = ({ checkpoint, isActive, onRestore }: CheckpointCardProps) => {
  const timeAgo = getTimeAgo(checkpoint.createdAt);

  return (
    <View style={[styles.checkpointCard, isActive && styles.checkpointCardActive]}>
      {/* Header */}
      <View style={styles.checkpointHeader}>
        <View style={styles.checkpointNumber}>
          <Text style={styles.checkpointNumberText}>
            {checkpoint.checkpointNumber}
          </Text>
        </View>
        <View style={styles.checkpointInfo}>
          <Text style={styles.checkpointLabel}>{checkpoint.label}</Text>
          <Text style={styles.checkpointTime}>{timeAgo}</Text>
        </View>
        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Current</Text>
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={styles.checkpointSettings}>
        <Text style={styles.settingsText}>
          {formatSettings(checkpoint.settings)}
        </Text>
      </View>

      {/* AI Analysis Summary */}
      {checkpoint.aiAnalysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.analysisLabel}>AI Analysis:</Text>
          <Text style={styles.analysisText}>
            {checkpoint.aiAnalysis.patternResult === 'correct'
              ? '✅ Pattern correct'
              : `🔍 ${checkpoint.aiAnalysis.issuesFound.join(', ')}`}
          </Text>
        </View>
      )}

      {/* User Feedback */}
      {checkpoint.userFeedback && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>Your feedback:</Text>
          <Text style={styles.feedbackText}>
            {checkpoint.userFeedback.subjectiveResponse || 'No feedback'}
          </Text>
        </View>
      )}

      {/* Restore Button */}
      {!isActive && (
        <TouchableOpacity style={styles.restoreButton} onPress={onRestore}>
          <Text style={styles.restoreButtonText}>Restore These Settings</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function CheckpointHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    checkpoints,
    currentCheckpointIndex,
    rollbackToCheckpoint,
    currentPatternSlug,
  } = useCalibrationStore();

  const handleRestore = (checkpointNumber: number) => {
    Alert.alert(
      'Restore Settings',
      `This will restore your TV settings to Checkpoint ${checkpointNumber}. You'll need to manually change your TV settings to match.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            const settings = rollbackToCheckpoint(checkpointNumber);
            Alert.alert(
              'Settings Restored',
              `Please set your TV to:\n\n${formatSettings(settings)}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (currentPatternSlug) {
                      navigation.navigate('Capture', {
                        patternSlug: currentPatternSlug,
                      });
                    } else {
                      navigation.goBack();
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Sort checkpoints by number (newest first)
  const sortedCheckpoints = [...checkpoints].sort(
    (a, b) => b.checkpointNumber - a.checkpointNumber
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings History</Text>
          <Text style={styles.subtitle}>
            {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''} saved
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Each checkpoint saves your TV settings at that moment. You can
            restore any checkpoint if you want to go back to how things were.
          </Text>
        </View>

        {/* Checkpoint List */}
        <View style={styles.checkpointList}>
          {sortedCheckpoints.map((checkpoint) => (
            <CheckpointCard
              key={checkpoint.id}
              checkpoint={checkpoint}
              isActive={checkpoint.checkpointNumber === currentCheckpointIndex}
              onRestore={() => handleRestore(checkpoint.checkpointNumber)}
            />
          ))}
        </View>

        {/* Empty State */}
        {checkpoints.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No checkpoints yet</Text>
            <Text style={styles.emptySubtext}>
              Your settings history will appear here as you calibrate
            </Text>
          </View>
        )}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  checkpointList: {
    gap: 16,
  },
  checkpointCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  checkpointCardActive: {
    borderColor: '#6c63ff',
  },
  checkpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkpointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkpointNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  checkpointTime: {
    fontSize: 12,
    color: '#888',
  },
  activeIndicator: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 12,
    color: '#6c63ff',
    fontWeight: '600',
  },
  checkpointSettings: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  settingsText: {
    fontSize: 13,
    color: '#888',
  },
  analysisSection: {
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  analysisText: {
    fontSize: 14,
    color: '#888',
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  restoreButton: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
