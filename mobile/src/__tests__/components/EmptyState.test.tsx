import React from 'react';
import { render, fireEvent } from '../../utils/test-utils';
import EmptyState from '../../components/EmptyState';

// Mock Lucide icon
const MockIcon = (props: any) => <div testID="mock-icon" {...props} />;

describe('EmptyState Component', () => {
  const defaultProps = {
    icon: MockIcon as any,
    title: 'No Results',
    description: 'We could not find anything matching your search.',
  };

  it('renders title and description correctly', () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    
    expect(getByText('No Results')).toBeTruthy();
    expect(getByText('We could not find anything matching your search.')).toBeTruthy();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const onActionMock = jest.fn();
    const { getByText } = render(
      <EmptyState 
        {...defaultProps} 
        actionLabel="Retry" 
        onAction={onActionMock} 
      />
    );
    
    const button = getByText('Retry');
    expect(button).toBeTruthy();
    
    fireEvent.press(button);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('does not render button when actionLabel or onAction is missing', () => {
    const { queryByText } = render(<EmptyState {...defaultProps} />);
    expect(queryByText('Retry')).toBeNull();
  });
});
