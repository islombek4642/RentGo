import React from 'react';
import { fireEvent, render } from '../../utils/test-utils';
import Input from '../../components/Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Input label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('handles text change', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeTextMock} />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'Hello World');
    expect(onChangeTextMock).toHaveBeenCalledWith('Hello World');
  });

  it('displays error message', () => {
    const { getByText } = render(<Input error="Invalid input" />);
    expect(getByText('Invalid input')).toBeTruthy();
  });

  it('handles focus and blur', () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Focus me" onFocus={onFocusMock} onBlur={onBlurMock} />
    );
    
    const input = getByPlaceholderText('Focus me');
    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();
    
    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    const { getByText, queryByText } = render(
      <Input isPassword={true} placeholder="Password" />
    );
    
    // Default: Show 'Eye' (showPassword is false)
    expect(getByText('Eye')).toBeTruthy();
    expect(queryByText('EyeOff')).toBeNull();
    
    // Toggle
    fireEvent.press(getByText('Eye'));
    
    // Now: Show 'EyeOff' (showPassword is true)
    expect(getByText('EyeOff')).toBeTruthy();
    expect(queryByText('Eye')).toBeNull();
  });
});
