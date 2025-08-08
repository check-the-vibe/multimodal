import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';

export type StackPagerProps<T> = {
  items: T[];
  renderItem: (item: T, index: number, selected: boolean) => ReactNode;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  loop?: boolean;
  cardWidth?: number;
  style?: ViewStyle;
};

export default function StackPager<T>({ items, renderItem, selectedIndex, onIndexChange, loop = false, cardWidth, style }: StackPagerProps<T>) {
  const { width: vw } = useWindowDimensions();
  // Make cards wider for a stronger, immersive feel
  const width = cardWidth ?? vw * 0.95;
  const ref = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    if (ref.current && selectedIndex !== currentIndex) {
      ref.current.scrollTo({ x: selectedIndex * width, animated: true });
      setCurrentIndex(selectedIndex);
    }
  }, [selectedIndex, currentIndex, width]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / Math.max(1, width));
    const next = Math.max(0, Math.min(idx, items.length - 1));
    if (next !== currentIndex) {
      setCurrentIndex(next);
      onIndexChange(next);
    }
  };

  return (
    <View style={[styles.container, style]}> 
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        snapToInterval={width}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: (vw - width) / 2 }}
      >
        {items.map((it, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });
          
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [8, 0, 8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.card,
                {
                  width,
                  transform: [{ scale }, { translateY }],
                  opacity,
                },
              ]}
            >
              {renderItem(it, i, i === currentIndex)}
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  card: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
});
