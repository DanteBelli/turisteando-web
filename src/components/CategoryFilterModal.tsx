import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Checkbox,
} from 'react-native';
import { apiClient } from '../api/client';

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (selectedCategories: number[]) => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilter,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      console.log('Categories loaded:', response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleApplyFilter = () => {
    onApplyFilter(selectedCategories);
    onClose();
  };

  const handleClearFilter = () => {
    setSelectedCategories([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrar por Categorías</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <ScrollView style={styles.categoriesList}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.includes(category.id) &&
                          styles.checkboxChecked,
                      ]}
                    >
                      {selectedCategories.includes(category.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCategoriesText}>
                  No hay categorías disponibles
                </Text>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearFilter}
            >
              <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.applyButton,
                selectedCategories.length === 0 && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyFilter}
              disabled={selectedCategories.length === 0}
            >
              <Text style={styles.applyButtonText}>
                Aplicar ({selectedCategories.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
  },
  categoriesList: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  centerContent: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  noCategoriesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
