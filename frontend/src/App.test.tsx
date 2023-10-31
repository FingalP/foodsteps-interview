import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the global fetch function
global.fetch = jest.fn();

describe('App', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  test('renders App component and fetches data', async () => {
    // Provide a mock implementation for fetch
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('users')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              id: 1,
              name: 'Test User',
              username: 'testuser',
              email: 'testuser@example.com',
              address: {
                street: 'Test Street',
                suite: 'Test Suite',
                city: 'Test City',
                zipcode: 'Test Zipcode',
                geo: {
                  lat: '0',
                  lng: '0',
                },
              },
              phone: 'Test Phone',
              website: 'testwebsite.com',
              company: {
                name: 'Test Company',
                catchPhrase: 'Test CatchPhrase',
                bs: 'Test BS',
              },
            },
          ]),
        });
      }

      if (url.includes('posts')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              id: 1,
              userId: 1,
              title: 'Test Old Post Title',
              body: 'Test Old Post Body',
            },
            {
              id: 2,
              userId: 1,
              title: 'Test Post Title',
              body: 'Test Post Body',
            },
          ]),
        });
      }
    });

    render(<App />);

    // Wait for the fetch calls to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    // Check if user data is rendered
    expect(screen.getByText('Test User')).toBeInTheDocument();

    // Check if post data is rendered
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('Test Post Body')).toBeInTheDocument();
  });
});