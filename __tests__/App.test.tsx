import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from '../App';

describe('<App />', () => {
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());
  it('renders without crashing', async () => {
    let comp: renderer.ReactTestRenderer;
    await act(async () => {
      comp = renderer.create(<App />);
      jest.runAllTimers();
    });
    comp!.unmount();
    expect(true).toBe(true);
  });
});
