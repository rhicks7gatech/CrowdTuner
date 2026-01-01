import React from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CrowdTuner</Text>
          <Text style={styles.subtitle}>
            Get the perfect picture on your TV
          </Text>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>

          {/* Quick Fix */}
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => navigation.navigate('TVIdentify')}
          >
            <View style={styles.modeIcon}>
              <Text style={styles.modeIconText}>🎯</Text>
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Quick Fix</Text>
              <Text style={styles.modeTime}>5-10 minutes</Text>
              <Text style={styles.modeDescription}>
                Fix a specific issue like gray blacks, washed out colors, or
                over-sharpening
              </Text>
            </View>
          </TouchableOpacity>

          {/* Full Calibration */}
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => navigation.navigate('TVIdentify')}
          >
            <View style={styles.modeIcon}>
              <Text style={styles.modeIconText}>📺</Text>
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Full Calibration</Text>
              <Text style={styles.modeTime}>15-30 minutes</Text>
              <Text style={styles.modeDescription}>
                Optimize all your picture settings for the best possible image
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How it works</Text>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Identify your TV</Text>
              <Text style={styles.stepDescription}>
                Scan the label or enter your model number
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Display test patterns</Text>
              <Text style={styles.stepDescription}>
                Show special patterns on your TV screen
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI analyzes & guides</Text>
              <Text style={styles.stepDescription}>
                Get personalized recommendations for your TV
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Adjust until perfect</Text>
              <Text style={styles.stepDescription}>
                Iterate with feedback until you're happy
              </Text>
            </View>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  modeSection: {
    marginBottom: 32,
  },
  modeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  modeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeIconText: {
    fontSize: 24,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  modeTime: {
    fontSize: 12,
    color: '#6c63ff',
    marginBottom: 6,
  },
  modeDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  howItWorks: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#888',
  },
});
