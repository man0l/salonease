import React, { act } from 'react';
import { render } from '@testing-library/react';
import { SalonProvider, useSalonContext } from '../SalonContext';
import { useSalon } from '../../hooks/useSalon';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/useSalon');
jest.mock('../../hooks/useAuth');

describe('SalonContext', () => {
  const mockSalons = [
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Salon A' },
    { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Salon B' },
  ];

  const mockUseSalon = {
    salons: mockSalons,
    loading: false,
    error: null,
    fetchSalons: jest.fn(),
    addSalon: jest.fn(),
    updateSalon: jest.fn(),
    deleteSalon: jest.fn(),
    currentPage: 1,
    totalPages: 1,
    setCurrentPage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSalon.mockReturnValue(mockUseSalon);
    // Mock useAuth to return a user
    useAuth.mockReturnValue({ user: { id: 'testUserId' } });
  });

  test('provides salon context values', async () => {
    let contextValue;
    const TestComponent = () => {
      contextValue = useSalonContext();
      return null;
    };

    await act(async () => {
      render(
        <SalonProvider>
          <TestComponent />
        </SalonProvider>
      );
    });

    expect(contextValue).toEqual(expect.objectContaining({
      salons: mockSalons,
      loading: false,
      error: null,
      selectedSalon: mockSalons[0],
      setSelectedSalon: expect.any(Function),
      addSalon: expect.any(Function),
      updateSalon: expect.any(Function),
      deleteSalon: expect.any(Function),
      fetchSalons: expect.any(Function),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: expect.any(Function),
    }));
  });

  test('setSelectedSalon updates the selected salon', async () => {
    let contextValue;
    const TestComponent = () => {
      contextValue = useSalonContext();
      return null;
    };

    await act(async () => {
      render(
        <SalonProvider>
          <TestComponent />
        </SalonProvider>
      );
    });

    expect(contextValue.selectedSalon).toEqual(mockSalons[0]);

    await act(async () => {
      contextValue.setSelectedSalon(mockSalons[1]);
    });

    expect(contextValue.selectedSalon).toEqual(mockSalons[1]);
  });

  test('addSalon calls hookAddSalon and updates selectedSalon', async () => {
    const newSalon = { id: '323e4567-e89b-12d3-a456-426614174002', name: 'New Salon' };
    mockUseSalon.addSalon.mockResolvedValue(newSalon);
    
    // Update the mock to include the new salon
    const updatedMockSalons = [...mockSalons, newSalon];
    mockUseSalon.fetchSalons.mockImplementation(() => {
      mockUseSalon.salons = updatedMockSalons;
    });

    let contextValue;
    const TestComponent = () => {
      contextValue = useSalonContext();
      return null;
    };

    await act(async () => {
      render(
        <SalonProvider>
          <TestComponent />
        </SalonProvider>
      );
    });

    await act(async () => {
      await contextValue.addSalon(newSalon);
    });

    expect(mockUseSalon.addSalon).toHaveBeenCalledWith(newSalon);
    expect(mockUseSalon.fetchSalons).toHaveBeenCalled();

    // Use a small timeout to allow for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(contextValue.selectedSalon).toEqual(newSalon);
    expect(contextValue.salons).toEqual(updatedMockSalons);
  });

  test('deleteSalon calls hookDeleteSalon and updates selectedSalon', async () => {
    mockUseSalon.deleteSalon.mockResolvedValue(true);

    let contextValue;
    const TestComponent = () => {
      contextValue = useSalonContext();
      return null;
    };

    await act(async () => {
      render(
        <SalonProvider>
          <TestComponent />
        </SalonProvider>
      );
    });

    await act(async () => {
      await contextValue.deleteSalon('123e4567-e89b-12d3-a456-426614174000');
    });

    expect(mockUseSalon.deleteSalon).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    // The selected salon should now be the first salon in the updated list
    expect(contextValue.selectedSalon).toEqual(mockSalons[0]);
  });

  test('fetchSalons is called on mount', async () => {
    await act(async () => {
      render(
        <SalonProvider>
          <div />
        </SalonProvider>
      );
    });

    expect(mockUseSalon.fetchSalons).toHaveBeenCalled();
  });
});
