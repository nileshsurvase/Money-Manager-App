import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock performance.now()
const mockPerformanceNow = jest.fn();
Object.defineProperty(global.performance, 'now', {
  writable: true,
  value: mockPerformanceNow,
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  test('initializes with correct component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.getMetrics()).toEqual({
      renderCount: 1,
      totalRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0
    });
  });

  test('measures async operations', async () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    mockPerformanceNow
      .mockReturnValueOnce(0)    // Start time
      .mockReturnValueOnce(50);  // End time
    
    const asyncOperation = jest.fn().mockResolvedValue('result');
    
    const measuredResult = await result.current.measureAsync(asyncOperation, 'testOperation');
    
    expect(measuredResult).toBe('result');
    expect(asyncOperation).toHaveBeenCalled();
  });

  test('warns about slow async operations', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    mockPerformanceNow
      .mockReturnValueOnce(0)     // Start time
      .mockReturnValueOnce(1500); // End time (slow)
    
    const asyncOperation = jest.fn().mockResolvedValue('result');
    
    await result.current.measureAsync(asyncOperation, 'slowOperation');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow async operation in TestComponent.slowOperation')
    );
    
    consoleSpy.mockRestore();
  });

  test('handles async operation errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    mockPerformanceNow
      .mockReturnValueOnce(0)   // Start time
      .mockReturnValueOnce(100); // End time
    
    const asyncOperation = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await expect(
      result.current.measureAsync(asyncOperation, 'failingOperation')
    ).rejects.toThrow('Test error');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed async operation in TestComponent.failingOperation'),
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  test('tracks render metrics correctly', () => {
    const { result, rerender } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    // Initial render
    expect(result.current.getMetrics().renderCount).toBe(1);
    
    // Trigger re-render
    rerender();
    expect(result.current.getMetrics().renderCount).toBe(2);
    
    // Another re-render
    rerender();
    expect(result.current.getMetrics().renderCount).toBe(3);
  });

  test('returns immutable metrics object', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    const metrics1 = result.current.getMetrics();
    const metrics2 = result.current.getMetrics();
    
    expect(metrics1).not.toBe(metrics2); // Different objects
    expect(metrics1).toEqual(metrics2);  // Same content
  });
});