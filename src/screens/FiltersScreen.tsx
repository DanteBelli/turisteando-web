import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, CheckBox } from 'react-native';

interface FilterOptions {
  categories: string[];
  endDate?: string;
  locations: string[];
}

interface FiltersScreenProps {
  onApplyFilters: (filters: FilterOptions) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Cafe',
  'Al Aire Libre',
  'Gastronomía',
  'Música',
  'Deporte',
  'Cultura',
  'Aventura'
];

const LOCATIONS = [
  'Buenos Aires Centro',
  'San Telmo',
  'La Boca',
  'Recoleta',
  'Palermo',
  'Villa Crespo'
];

export default function FiltersScreen({ onApplyFilters, onClose }: FiltersScreenProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      categories: selectedCategories,
      locations: selectedLocations,
    });
    onClose();
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filtros</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Categories Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.optionsContainer}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.optionItem,
                  selectedCategories.includes(category) && styles.optionItemSelected
                ]}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedCategories.includes(category) && styles.checkboxChecked
                    ]}
                  >
                    {selectedCategories.includes(category) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedCategories.includes(category) && styles.optionLabelSelected
                    ]}
                  >
                    {category}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Locations Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.optionsContainer}>
            {LOCATIONS.map(location => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.optionItem,
                  selectedLocations.includes(location) && styles.optionItemSelected
                ]}
                onPress={() => toggleLocation(location)}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedLocations.includes(location) && styles.checkboxChecked
                    ]}
                  >
                    {selectedLocations.includes(location) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedLocations.includes(location) && styles.optionLabelSelected
                    ]}
                  >
                    {location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Filters Summary */}
        {(selectedCategories.length > 0 || selectedLocations.length > 0) && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Filtros aplicados:</Text>
            <View style={styles.selectedFiltersContainer}>
              {selectedCategories.map(cat => (
                <View key={cat} style={styles.selectedFilterChip}>
                  <Text style={styles.selectedFilterText}>{cat}</Text>
                  <TouchableOpacity onPress={() => toggleCategory(cat)}>
                    <Text style={styles.chipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {selectedLocations.map(loc => (
                <View key={loc} style={styles.selectedFilterChip}>
                  <Text style={styles.selectedFilterText}>{loc}</Text>
                  <TouchableOpacity onPress={() => toggleLocation(loc)}>
                    <Text style={styles.chipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Limpiar filtros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Aplicar filtros</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  filterSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  optionItemSelected: {
    backgroundColor: '#f0f7f0',
    borderLeftWidth: 3,
    borderLeftColor: '#28A745',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#28A745',
    backgroundColor: '#28A745',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: '#28A745',
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  selectedFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  selectedFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  chipRemove: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#28A745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
