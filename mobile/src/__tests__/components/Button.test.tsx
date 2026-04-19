import React from 'react';
import { fireEvent, render } from '../../utils/test-utils';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles onPress event', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state', () => {
    const { getByRole, queryByText } = render(<Button title="Submit" loading={true} />);
    // When loading, ActivityIndicator should be present and text should not be visible
    expect(queryByText('Submit')).toBeNull();
  });

  it('is disabled when loading prop is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Disabled" loading={true} onPress={onPressMock} testID="button" />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Disabled" disabled={true} onPress={onPressMock} testID="button" />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
