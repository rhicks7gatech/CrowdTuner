import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TVIdentifyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setTVModel, setLoading, isLoading } = useCalibrationStore();

  const [modelNumber, setModelNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanLabel = () => {
    // TODO: Implement ML Kit OCR scanning
    // For now, show a placeholder message
    setError('Camera scanning coming soon! Please enter your model number manually.');
  };

  const handleSearch = async () => {
    if (!modelNumber.trim()) {
      setError('Please enter a model number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Call Supabase to search for model, or trigger AI research
      // For now, simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulated response
      const mockResult = {
        model: {
          id: 'mock-id',
          brandId: 'samsung-id',
          brandName: 'Samsung',
          modelNumber: modelNumber.toUpperCase(),
          modelAliases: [],
          displayName: `Samsung ${modelNumber.toUpperCase()}`,
          year: 2023,
          panelType: 'QLED' as const,
          resolution: '4K',
          smartPlatform: 'Tizen',
          researchConfidence: 0.85,
        },
        settings: [
          {
            id: '1',
            modelId: 'mock-id',
            settingName: 'Backlight',
            settingCategory: 'basic' as const,
            settingType: 'slider' as const,
            rangeMin: 0,
            rangeMax: 20,
            defaultValue: 15,
            menuPath: ['Settings', 'Picture', 'Expert Settings'],
            confidence: 0.9,
          },
          {
            id: '2',
            modelId: 'mock-id',
            settingName: 'Brightness',
            settingCategory: 'basic' as const,
            settingType: 'slider' as const,
            rangeMin: 0,
            rangeMax: 100,
            defaultValue: 50,
            menuPath: ['Settings', 'Picture', 'Expert Settings'],
            actualFunction: 'Controls black level, not overall brightness',
            confidence: 0.9,
          },
          {
            id: '3',
            modelId: 'mock-id',
            settingName: 'Contrast',
            settingCategory: 'basic' as const,
            settingType: 'slider' as const,
            rangeMin: 0,
            rangeMax: 100,
            defaultValue: 45,
            menuPath: ['Settings', 'Picture', 'Expert Settings'],
            confidence: 0.9,
          },
          {
            id: '4',
            modelId: 'mock-id',
            settingName: 'Color',
            settingCategory: 'basic' as const,
            settingType: 'slider' as const,
            rangeMin: 0,
            rangeMax: 100,
            defaultValue: 25,
            menuPath: ['Settings', 'Picture', 'Expert Settings'],
            confidence: 0.9,
          },
          {
            id: '5',
            modelId: 'mock-id',
            settingName: 'Sharpness',
            settingCategory: 'basic' as const,
            settingType: 'slider' as const,
            rangeMin: 0,
            rangeMax: 20,
            defaultValue: 10,
            menuPath: ['Settings', 'Picture', 'Expert Settings'],
            confidence: 0.9,
          },
        ],
        isNewModel: false,
      };

      setSearchResult(mockResult);
      setTVModel(mockResult.model, mockResult.settings);
    } catch (err) {
      setError('Failed to search for TV model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (searchResult) {
      navigation.navigate('Environment');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Let's identify your TV so we can provide model-specific guidance.
        </Text>

        {/* Scan Option */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanLabel}>
          <Text style={styles.scanIcon}>📷</Text>
          <View style={styles.scanContent}>
            <Text style={styles.scanTitle}>Scan TV Label</Text>
            <Text style={styles.scanDescription}>
              Point camera at the sticker on the back of your TV
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Entry */}
        <View style={styles.manualSection}>
          <Text style={styles.label}>Enter Model Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., UN55TU8000FXZA"
            placeholderTextColor="#666"
            value={modelNumber}
            onChangeText={setModelNumber}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search Result */}
        {searchResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>TV Found!</Text>
            <View style={styles.resultDetails}>
              <Text style={styles.resultBrand}>{searchResult.model.brandName}</Text>
              <Text style={styles.resultModel}>
                {searchResult.model.displayName}
              </Text>
              <View style={styles.resultSpecs}>
                <Text style={styles.resultSpec}>
                  {searchResult.model.panelType} • {searchResult.model.resolution}
                </Text>
                <Text style={styles.resultSpec}>
                  {searchResult.model.smartPlatform} • {searchResult.model.year}
                </Text>
              </View>
              <Text style={styles.resultSettings}>
                {searchResult.settings.length} picture settings identified
              </Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Yes, that's my TV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wrongButton}
              onPress={() => {
                setSearchResult(null);
                setModelNumber('');
              }}
            >
              <Text style={styles.wrongButtonText}>Not my TV, try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Where to find your model number:</Text>
          <Text style={styles.helpText}>
            • On a sticker on the back of your TV{'\n'}
            • In the TV's Settings → Support → About{'\n'}
            • On the original box or receipt
          </Text>
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
  instructions: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  scanIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  scanDescription: {
    fontSize: 14,
    color: '#888',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a4e',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  manualSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6c63ff',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c63ff',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDetails: {
    marginBottom: 16,
  },
  resultBrand: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  resultModel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSpecs: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resultSpec: {
    fontSize: 14,
    color: '#888',
  },
  resultSettings: {
    fontSize: 14,
    color: '#6c63ff',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  wrongButton: {
    padding: 12,
    alignItems: 'center',
  },
  wrongButtonText: {
    color: '#888',
    fontSize: 14,
  },
  helpSection: {
    marginTop: 16,
  },
  helpTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
