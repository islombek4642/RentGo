import React from 'react';
import { fireEvent, render } from '../../utils/test-utils';
import CarCard from '../../components/CarCard';

describe('CarCard Component', () => {
  const mockCar = {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    pricePerDay: 150,
    location: 'Tashkent',
    imageUrl: 'https://example.com/tesla.jpg',
  };

  it('renders correctly with car data', () => {
    const { getByText } = render(<CarCard {...mockCar} />);
    
    expect(getByText('Tesla Model 3')).toBeTruthy();
    expect(getByText('2023')).toBeTruthy();
    expect(getByText('Tashkent')).toBeTruthy();
    expect(getByText('150 $')).toBeTruthy();
    expect(getByText('car.per_day')).toBeTruthy(); // Using mocked translation key
  });

  it('handles onPress event', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<CarCard {...mockCar} onPress={onPressMock} />);
    
    fireEvent.press(getByText('Tesla Model 3'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('handles button press event', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<CarCard {...mockCar} onPress={onPressMock} />);
    
    fireEvent.press(getByText('car.view'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
