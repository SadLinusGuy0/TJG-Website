import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  const renderWithTheme = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders all theme options', () => {
    renderWithTheme(<ThemeToggle />);
    
    expect(screen.getByLabelText('Light')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto')).toBeInTheDocument();
  });

  it('defaults to auto theme', () => {
    renderWithTheme(<ThemeToggle />);
    
    const autoRadio = screen.getByLabelText('Auto') as HTMLInputElement;
    expect(autoRadio.checked).toBe(true);
  });

  it('changes theme when selecting a different option', () => {
    renderWithTheme(<ThemeToggle />);
    
    const darkRadio = screen.getByLabelText('Dark') as HTMLInputElement;
    fireEvent.click(darkRadio);
    
    expect(darkRadio.checked).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'light');
    renderWithTheme(<ThemeToggle />);
    
    const lightRadio = screen.getByLabelText('Light') as HTMLInputElement;
    expect(lightRadio.checked).toBe(true);
  });
}); 