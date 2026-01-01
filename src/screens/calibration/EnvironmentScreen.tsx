import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import type { RoomLighting, WindowPosition, ViewingTime } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OptionButtonProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

const OptionButton = ({ icon, label, selected, onPress }: OptionButtonProps) => (
  <TouchableOpacity
    style={[styles.optionButton, selected && styles.optionButtonSelected]}
    onPress={onPress}
  >
    <Text style={styles.optionIcon}>{icon}</Text>
    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function EnvironmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setEnvironment, tvModel } = useCalibrationStore();

  const [roomLighting, setRoomLighting] = useState<RoomLighting>('dim');
  const [windows, setWindows] = useState<WindowPosition>('none');
  const [viewingTime, setViewingTime] = useState<ViewingTime>('evening');
  const [distance, setDistance] = useState('8');

  const handleContinue = () => {
    setEnvironment({
      roomLighting,
      windows,
      viewingTime,
      distanceFeet: parseFloat(distance) || 8,
    });
    navigation.navigate('SettingsEntry');
  };

  // Calculate recommended distance based on TV size (if known)
  const getDistanceHint = () => {
    // Common TV sizes and their recommended viewing distances
    // Roughly 1.5x the diagonal for 4K content
    return 'For most TVs, 6-10 feet works well for 4K content.';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          Tell us about your viewing setup so we can tailor recommendations to
          your environment.
        </Text>

        {/* Room Lighting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Lighting</Text>
          <Text style={styles.sectionDescription}>
            How bright is the room when you usually watch?
          </Text>
          <View style={styles.optionsRow}>
            <OptionButton
              icon="☀️"
              label="Bright"
              selected={roomLighting === 'bright'}
              onPress={() => setRoomLighting('bright')}
            />
            <OptionButton
              icon="🌤️"
              label="Dim"
              selected={roomLighting === 'dim'}
              onPress={() => setRoomLighting('dim')}
            />
            <OptionButton
              icon="🌙"
              label="Dark"
              selected={roomLighting === 'dark'}
              onPress={() => setRoomLighting('dark')}
            />
          </View>
        </View>

        {/* Windows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Windows</Text>
          <Text style={styles.sectionDescription}>
            Where are windows relative to your TV?
          </Text>
          <View style={styles.optionsGrid}>
            <OptionButton
              icon="⬆️"
              label="Behind TV"
              selected={windows === 'behind_tv'}
              onPress={() => setWindows('behind_tv')}
            />
            <OptionButton
              icon="↔️"
              label="To the Side"
              selected={windows === 'side'}
              onPress={() => setWindows('side')}
            />
            <OptionButton
              icon="⬇️"
              label="Behind Me"
              selected={windows === 'behind_viewer'}
              onPress={() => setWindows('behind_viewer')}
            />
            <OptionButton
              icon="🚫"
              label="None"
              selected={windows === 'none'}
              onPress={() => setWindows('none')}
            />
          </View>
        </View>

        {/* Viewing Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When do you usually watch?</Text>
          <View style={styles.optionsRow}>
            <OptionButton
              icon="🌅"
              label="Daytime"
              selected={viewingTime === 'day'}
              onPress={() => setViewingTime('day')}
            />
            <OptionButton
              icon="🌆"
              label="Evening"
              selected={viewingTime === 'evening'}
              onPress={() => setViewingTime('evening')}
            />
            <OptionButton
              icon="🔄"
              label="Mixed"
              selected={viewingTime === 'mixed'}
              onPress={() => setViewingTime('mixed')}
            />
          </View>
        </View>

        {/* Viewing Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viewing Distance</Text>
          <Text style={styles.sectionDescription}>
            How far do you sit from the TV? (in feet)
          </Text>
          <View style={styles.distanceInputContainer}>
            <TextInput
              style={styles.distanceInput}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="8"
              placeholderTextColor="#666"
            />
            <Text style={styles.distanceUnit}>feet</Text>
          </View>
          <Text style={styles.distanceHint}>{getDistanceHint()}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Setup</Text>
          <Text style={styles.summaryText}>
            {roomLighting === 'bright' && '☀️ Bright room'}
            {roomLighting === 'dim' && '🌤️ Dim room'}
            {roomLighting === 'dark' && '🌙 Dark room'}
            {' • '}
            {viewingTime === 'day' && 'Daytime viewing'}
            {viewingTime === 'evening' && 'Evening viewing'}
            {viewingTime === 'mixed' && 'Mixed viewing times'}
            {' • '}
            {distance} feet away
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  instructions: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a4e',
  },
  optionButtonSelected: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  distanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    width: 100,
    textAlign: 'center',
  },
  distanceUnit: {
    fontSize: 16,
    color: '#888',
  },
  distanceHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
