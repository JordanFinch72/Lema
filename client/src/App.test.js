import { render, screen } from '@testing-library/react';
import Lema from './Lema';

test('renders learn react link', () => {
  render(<Lema />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
