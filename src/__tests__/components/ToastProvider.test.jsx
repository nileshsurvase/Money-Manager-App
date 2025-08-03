import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../components/ToastProvider';

// Test component that uses the toast hook
const TestComponent = () => {
  const { success, error, warning, info, dismissAll } = useToast();
  
  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button onClick={dismissAll}>Dismiss All</button>
    </div>
  );
};

const renderWithToastProvider = (component) => {
  return render(
    <ToastProvider>
      {component}
    </ToastProvider>
  );
};

describe('ToastProvider', () => {
  test('renders children correctly', () => {
    renderWithToastProvider(<div>Test content</div>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('shows success toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Success'));
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  test('shows error toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Error'));
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('shows warning toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Warning'));
    
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  test('shows info toast', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Info'));
    
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  test('dismisses toast when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /close/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  test('dismisses all toasts', async () => {
    const user = userEvent.setup();
    renderWithToastProvider(<TestComponent />);
    
    await user.click(screen.getByText('Success'));
    await user.click(screen.getByText('Error'));
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    await user.click(screen.getByText('Dismiss All'));
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  test('auto-dismisses toast after duration', async () => {
    jest.useFakeTimers();
    
    const TestComponentWithShortDuration = () => {
      const { success } = useToast();
      return (
        <button onClick={() => success('Auto dismiss', { duration: 1000 })}>
          Success
        </button>
      );
    };

    renderWithToastProvider(<TestComponentWithShortDuration />);
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByText('Success'));
    
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('throws error when useToast is used outside ToastProvider', () => {
    const TestComponentWithoutProvider = () => {
      useToast();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    
    consoleSpy.mockRestore();
  });
});