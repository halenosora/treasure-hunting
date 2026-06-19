import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

test('renders treasure hunting title', () => {
  render(<App />);
  const titleElement = screen.getByText(/たからさがし/i);
  expect(titleElement).toBeInTheDocument();
});
