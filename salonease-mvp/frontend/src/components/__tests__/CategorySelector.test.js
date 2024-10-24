import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CategorySelector from '../CategorySelector';

const mockCategories = [
  {
    id: 1,
    name: 'Hair Services',
    children: [
      { id: 2, name: 'Haircut' },
      { id: 3, name: 'Coloring' },
    ],
  },
  {
    id: 4,
    name: 'Nail Services',
    children: [
      { id: 5, name: 'Manicure' },
      { id: 6, name: 'Pedicure' },
    ],
  },
];

describe('CategorySelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    expect(screen.getByText('Select a category')).toBeInTheDocument();
  });

  it('opens the dropdown when clicked', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Select a category'));
    await waitFor(() => {
      expect(screen.getByText('Hair Services')).toBeInTheDocument();
      expect(screen.getByText('Nail Services')).toBeInTheDocument();
    });
  });

  it('displays nested categories when parent category is expanded', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText('Select a category'));
    
    const hairServicesButton = screen.getByTestId('category-item-1'); // Hair Services has an id of 1
    const hairServicesChevron = hairServicesButton.querySelector('button > svg');
    fireEvent.click(hairServicesChevron);
    
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
      expect(screen.getByText('Coloring')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onChange with the correct value when a category is selected', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText('Select a category'));
    
    const hairServicesButton = screen.getByTestId('category-item-1'); // Hair Services has an id of 1
    const hairServicesChevron = hairServicesButton.querySelector('button > svg');
    fireEvent.click(hairServicesChevron);
    
    await waitFor(() => {
      const haircutButton = screen.getByText('Haircut');
      fireEvent.click(haircutButton);
    }, { timeout: 3000 });

    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  it('displays the selected category name when a value is provided', () => {
    render(<CategorySelector categories={mockCategories} value={2} onChange={mockOnChange} />);
    expect(screen.getByText('Haircut')).toBeInTheDocument();
  });

  it('filters categories based on search input', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText('Select a category'));
    
    const searchInput = await screen.findByPlaceholderText('Search categories...');
    fireEvent.change(searchInput, { target: { value: 'mani' } });

    await waitFor(() => {
      expect(screen.getByText('Manicure')).toBeInTheDocument();
      expect(screen.queryByText('Haircut')).not.toBeInTheDocument();
    });
  });

  it('closes the dropdown when clicking outside', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Select a category'));
    });
    
    expect(screen.getByText('Hair Services')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    
    expect(screen.queryByText('Hair Services')).not.toBeInTheDocument();
  });

  it('closes the dropdown when pressing Escape key', async () => {
    render(<CategorySelector categories={mockCategories} value={null} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Select a category'));
    expect(screen.getByText('Hair Services')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Hair Services')).not.toBeInTheDocument();
    });
  });
});
