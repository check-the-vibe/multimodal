import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ModalityCard from '../../ui/ModalityCard';

export type DrawingInputCardProps = {
  onDrawingComplete?: (svgPath: string) => void;
};

export default function DrawingInputCard({ onDrawingComplete }: DrawingInputCardProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        setCurrentPath(newPath);
        setIsDrawing(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => `${prev} L${locationX.toFixed(2)},${locationY.toFixed(2)}`);
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          const fullPath = `<path d="${currentPath}" stroke="${currentColor}" stroke-width="${strokeWidth}" fill="none"/>`;
          setPaths(prev => [...prev, fullPath]);
          onDrawingComplete?.(fullPath);
        }
        setCurrentPath('');
        setIsDrawing(false);
      },
    })
  ).current;

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const undo = () => {
    if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  };

  const colors = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const sizes = [2, 3, 5, 8];

  return (
    <ModalityCard tone="input" label="Drawing">
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <View style={styles.colorPalette}>
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor
                ]}
                onPress={() => setCurrentColor(color)}
              />
            ))}
          </View>
          <View style={styles.sizeButtons}>
            {sizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  strokeWidth === size && styles.selectedSize
                ]}
                onPress={() => setStrokeWidth(size)}
              >
                <View
                  style={[
                    styles.sizeDot,
                    { width: size * 2, height: size * 2, borderRadius: size }
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.canvasContainer} {...panResponder.panHandlers}>
          <Svg style={styles.canvas} width="100%" height="200">
            {paths.map((path, index) => {
              const pathMatch = path.match(/d="([^"]+)"/);
              const strokeMatch = path.match(/stroke="([^"]+)"/);
              const widthMatch = path.match(/stroke-width="([^"]+)"/);
              
              if (pathMatch) {
                return (
                  <Path
                    key={index}
                    d={pathMatch[1]}
                    stroke={strokeMatch ? strokeMatch[1] : '#000000'}
                    strokeWidth={widthMatch ? parseInt(widthMatch[1]) : 3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              }
              return null;
            })}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
          {!isDrawing && paths.length === 0 && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>✏️ Draw here</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={undo}>
            <Text style={styles.actionText}>↶ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearCanvas}>
            <Text style={styles.actionText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalityCard>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
  },
  toolbar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#374151',
  },
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  sizeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  selectedSize: {
    backgroundColor: '#e5e7eb',
  },
  sizeDot: {
    backgroundColor: '#374151',
  },
  canvasContainer: {
    height: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
  },
});