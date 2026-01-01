import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Results'>;

// Mock AI response - in production, this comes from Gemini via Edge Function
const mockAnalysis: {
  patternResult: 'correct' | 'issue_detected' | 'unclear';
  issuesFound: string[];
  observations: Array<{ element: string; expected: string; actual: string; isIssue: boolean }>;
  recommendation: {
    setting: string;
    currentValue: number;
    suggestedValue: string;
    direction: 'increase' | 'decrease' | 'set';
    reasoning: string;
    menuPath: string[];
  };
  confidence: number;
  conversationalResponse: string;
} = {
  patternResult: 'issue_detected',
  issuesFound: ['blacks_lifted'],
  observations: [
    { element: '2% bar', expected: 'invisible', actual: 'visible', isIssue: true },
    { element: '4% bar', expected: 'barely visible', actual: 'clearly visible', isIssue: true },
    { element: '6% bar', expected: 'visible', actual: 'visible', isIssue: false },
  ],
  recommendation: {
    setting: 'Brightness',
    currentValue: 50,
    suggestedValue: '45-47',
    direction: 'decrease' as const,
    reasoning: 'The 2% gray bar is visible when it should blend into the black background. This means your blacks are being "lifted" to gray.',
    menuPath: ['Settings', 'Picture', 'Expert Settings', 'Brightness'],
  },
  confidence: 0.85,
  conversationalResponse: `I can see from the pattern that your blacks are being "lifted" - they look dark gray instead of true black. This is why dark scenes in movies might look washed out.

The 2% gray bar is clearly visible when it should be invisible, and the 4% bar is more visible than it should be.

**Recommended fix:**

On your Samsung TV:
1. Press the Home button on your remote
2. Go to Settings (gear icon)
3. Select Picture
4. Select Expert Settings
5. Find "Brightness" (currently at 50)
6. **Lower it to around 45-47**

💡 *Note: On Samsung TVs, "Brightness" actually controls black level, not overall brightness. "Backlight" controls overall brightness.*

Let me know when you've made the change!`,
};

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const {
    createCheckpoint,
    currentSettings,
    updateCurrentSettings,
    tvModel,
    checkpoints,
  } = useCalibrationStore();

  const { patternSlug } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [newSettingValue, setNewSettingValue] = useState('');
  const [feedbackMode, setFeedbackMode] = useState<'none' | 'positive' | 'negative'>('none');
  const [subjectiveFeedback, setSubjectiveFeedback] = useState('');

  useEffect(() => {
    // Simulate AI analysis
    const analyzePattern = async () => {
      setIsAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    };

    analyzePattern();
  }, []);

  const handleApplyChange = () => {
    if (!analysis?.recommendation || !newSettingValue) return;

    const settingKey = analysis.recommendation.setting.toLowerCase();
    const newValue = parseFloat(newSettingValue);

    // Update current settings
    updateCurrentSettings({ [settingKey]: newValue });

    // Create checkpoint
    createCheckpoint({
      label: `Adjusted ${analysis.recommendation.setting} to ${newValue}`,
      settings: {
        ...currentSettings,
        [settingKey]: newValue,
      },
      aiAnalysis: analysis,
    });

    // Navigate back to capture for verification
    navigation.navigate('Capture', { patternSlug });
  };

  const handleFeelsGood = () => {
    setFeedbackMode('positive');
  };

  const handleFeelsBad = () => {
    setFeedbackMode('negative');
  };

  const handleSubmitFeedback = () => {
    // Save feedback and continue
    if (feedbackMode === 'positive') {
      // Pattern is correct and user is happy - move to next pattern or complete
      navigation.navigate('SessionComplete');
    } else {
      // User not happy - AI will adjust approach
      // For now, go back to capture with the feedback
      navigation.navigate('Capture', { patternSlug });
    }
  };

  const handleRollback = () => {
    navigation.navigate('CheckpointHistory');
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <Text style={styles.loadingText}>Analyzing pattern...</Text>
          <Text style={styles.loadingSubtext}>
            Checking black levels and comparing to reference
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Analysis Result Header */}
        <View style={styles.resultHeader}>
          {analysis?.patternResult === 'correct' ? (
            <>
              <Text style={styles.resultIcon}>✅</Text>
              <Text style={styles.resultTitle}>Looks Good!</Text>
            </>
          ) : (
            <>
              <Text style={styles.resultIcon}>🔍</Text>
              <Text style={styles.resultTitle}>Issue Detected</Text>
            </>
          )}
        </View>

        {/* AI Conversational Response */}
        <View style={styles.aiResponse}>
          <Text style={styles.aiResponseText}>
            {analysis?.conversationalResponse}
          </Text>
        </View>

        {/* Recommendation Card */}
        {analysis?.recommendation && (
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>Recommended Change</Text>

            <View style={styles.settingChange}>
              <View style={styles.settingCurrent}>
                <Text style={styles.settingLabel}>
                  {analysis.recommendation.setting}
                </Text>
                <Text style={styles.settingValue}>
                  {analysis.recommendation.currentValue}
                </Text>
                <Text style={styles.settingNote}>current</Text>
              </View>

              <Text style={styles.arrow}>→</Text>

              <View style={styles.settingNew}>
                <Text style={styles.settingLabel}>
                  {analysis.recommendation.setting}
                </Text>
                <Text style={styles.settingValueNew}>
                  {analysis.recommendation.suggestedValue}
                </Text>
                <Text style={styles.settingNote}>recommended</Text>
              </View>
            </View>

            <View style={styles.menuPath}>
              <Text style={styles.menuPathLabel}>📍 Where to find it:</Text>
              <Text style={styles.menuPathText}>
                {analysis.recommendation.menuPath.join(' → ')}
              </Text>
            </View>

            {/* Value input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                What value did you set it to?
              </Text>
              <TextInput
                style={styles.valueInput}
                value={newSettingValue}
                onChangeText={setNewSettingValue}
                keyboardType="number-pad"
                placeholder={analysis.recommendation.suggestedValue.toString()}
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.applyButton,
                !newSettingValue && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyChange}
              disabled={!newSettingValue}
            >
              <Text style={styles.applyButtonText}>
                I've Made This Change - Verify
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* If pattern is correct, ask for subjective feedback */}
        {analysis?.patternResult === 'correct' && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>
              The pattern looks correct, but how does it look to YOU?
            </Text>
            <Text style={styles.feedbackSubtitle}>
              Try watching a dark scene in a movie or show
            </Text>

            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  feedbackMode === 'positive' && styles.feedbackButtonSelected,
                ]}
                onPress={handleFeelsGood}
              >
                <Text style={styles.feedbackEmoji}>😊</Text>
                <Text style={styles.feedbackButtonText}>Looks great!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  feedbackMode === 'negative' && styles.feedbackButtonSelected,
                ]}
                onPress={handleFeelsBad}
              >
                <Text style={styles.feedbackEmoji}>🤔</Text>
                <Text style={styles.feedbackButtonText}>Something's off</Text>
              </TouchableOpacity>
            </View>

            {feedbackMode === 'negative' && (
              <View style={styles.feedbackInput}>
                <Text style={styles.feedbackInputLabel}>
                  What doesn't feel right?
                </Text>
                <TextInput
                  style={styles.feedbackTextInput}
                  value={subjectiveFeedback}
                  onChangeText={setSubjectiveFeedback}
                  placeholder="e.g., Too dark, can't see shadow details"
                  placeholderTextColor="#666"
                  multiline
                />
              </View>
            )}

            {feedbackMode !== 'none' && (
              <TouchableOpacity
                style={styles.submitFeedbackButton}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.submitFeedbackButtonText}>
                  {feedbackMode === 'positive'
                    ? 'Continue to Next Setting'
                    : 'Help Me Adjust'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Rollback option */}
        <TouchableOpacity style={styles.rollbackButton} onPress={handleRollback}>
          <Text style={styles.rollbackButtonText}>
            ↩️ Go back to a previous checkpoint
          </Text>
        </TouchableOpacity>

        {/* Confidence indicator */}
        {analysis && (
          <View style={styles.confidenceSection}>
            <Text style={styles.confidenceLabel}>
              Analysis confidence: {Math.round(analysis.confidence * 100)}%
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiResponse: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6c63ff',
  },
  aiResponseText: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 24,
  },
  recommendationCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c63ff',
    marginBottom: 16,
  },
  settingChange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  settingCurrent: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    minWidth: 100,
  },
  settingNew: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderRadius: 12,
    minWidth: 100,
  },
  settingLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  settingValueNew: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  settingNote: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: '#6c63ff',
    marginHorizontal: 16,
  },
  menuPath: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  menuPathLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  menuPathText: {
    fontSize: 14,
    color: '#fff',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  valueInput: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#3a3a5e',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a4e',
  },
  feedbackButtonSelected: {
    borderColor: '#6c63ff',
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  feedbackInput: {
    marginBottom: 16,
  },
  feedbackInputLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  feedbackTextInput: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitFeedbackButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitFeedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rollbackButton: {
    padding: 16,
    alignItems: 'center',
  },
  rollbackButtonText: {
    fontSize: 14,
    color: '#888',
  },
  confidenceSection: {
    alignItems: 'center',
    padding: 12,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#666',
  },
});
