// Mock splash screen to avoid async side effects at module load
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from '../App';

describe('App smoke', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  
  it('renders without crashing', async () => {
    let comp: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      comp = renderer.create(<App />);
      jest.runAllTimers();
    });
    expect(comp).toBeTruthy();
  });
  
  it('manages loading state with timer', async () => {
    // Test that the component sets up a timer for the loading overlay
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    await act(async () => {
      renderer.create(<App />);
    });
    
    // Verify setTimeout was called with 3000ms
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
    
    setTimeoutSpy.mockRestore();
  });
  
  it('creates app structure', async () => {
    let comp: renderer.ReactTestRenderer | undefined;
    
    await act(async () => {
      comp = renderer.create(<App />);
      // Wait for app to be ready (600ms) and skip past loading (3000ms)
      jest.advanceTimersByTime(3700);
    });
    
    // Just verify the component rendered
    expect(comp).toBeTruthy();
    
    // The component exists even if tree is null initially
    const instance = comp?.getInstance();
    expect(comp?.root).toBeTruthy();
  });
});

describe('Expo modules import', () => {
  const modules = [
    'expo-av',
    'expo-video',
    'expo-camera',
    'expo-image-picker',
    'expo-media-library',
    'expo-file-system',
    'expo-speech',
  ];

  it('resolves module entries without throwing', () => {
    for (const name of modules) {
      expect(() => require.resolve(name)).not.toThrow();
    }
  });
});
