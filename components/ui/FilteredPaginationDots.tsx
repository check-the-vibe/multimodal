import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

export type FilteredPaginationDotsProps = {
  allItems: string[];
  filteredItems: string[];
  selectedIndex: number;
  onDotPress: (index: number) => void;
  icons?: Record<string, string>;
};

export default function FilteredPaginationDots({ 
  allItems, 
  filteredItems, 
  selectedIndex, 
  onDotPress,
  icons 
}: FilteredPaginationDotsProps) {
  return (
    <View style={styles.container}>
      {allItems.map((item, idx) => {
        const isFiltered = filteredItems.includes(item);
        const filteredIndex = filteredItems.indexOf(item);
        const isActive = isFiltered && filteredIndex === selectedIndex;
        
        return (
          <Pressable
            key={item}
            style={[
              styles.dot,
              isActive && styles.dotActive,
              !isFiltered && styles.dotDisabled
            ]}
            onPress={() => {
              if (isFiltered && filteredIndex !== -1) {
                onDotPress(filteredIndex);
              }
            }}
            disabled={!isFiltered}
          >
            {icons && icons[item] ? (
              <Text style={[
                styles.dotIcon,
                isActive && styles.dotIconActive,
                !isFiltered && styles.dotIconDisabled
              ]}>
                {icons[item]}
              </Text>
            ) : (
              <View style={[
                styles.dotInner,
                isActive && styles.dotInnerActive,
                !isFiltered && styles.dotInnerDisabled
              ]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  dotDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.3,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  dotInnerActive: {
    backgroundColor: 'white',
  },
  dotInnerDisabled: {
    backgroundColor: '#d1d5db',
  },
  dotIcon: {
    fontSize: 16,
  },
  dotIconActive: {
    color: 'white',
  },
  dotIconDisabled: {
    opacity: 0.5,
  },
});