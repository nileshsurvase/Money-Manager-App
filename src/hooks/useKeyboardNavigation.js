import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardNavigation = (items, options = {}) => {
  const {
    onSelect,
    onEscape,
    loop = true,
    disabled = false,
    focusOnMount = false,
    itemSelector = '[data-keyboard-nav-item]',
    containerRef
  } = options;

  const currentIndexRef = useRef(-1);
  const itemsRef = useRef([]);

  // Update items reference
  useEffect(() => {
    if (containerRef?.current) {
      itemsRef.current = Array.from(
        containerRef.current.querySelectorAll(itemSelector)
      );
    } else {
      itemsRef.current = items || [];
    }
  }, [items, itemSelector, containerRef]);

  // Focus first item on mount if requested
  useEffect(() => {
    if (focusOnMount && itemsRef.current.length > 0) {
      currentIndexRef.current = 0;
      focusItem(0);
    }
  }, [focusOnMount]);

  const focusItem = useCallback((index) => {
    const items = itemsRef.current;
    if (items[index]) {
      if (items[index].focus) {
        items[index].focus();
      } else if (items[index].querySelector) {
        const focusable = items[index].querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        }
      }
      currentIndexRef.current = index;
    }
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (disabled || itemsRef.current.length === 0) return;

    const items = itemsRef.current;
    const currentIndex = currentIndexRef.current;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = loop 
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
        focusItem(nextIndex);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = loop
          ? currentIndex <= 0 ? items.length - 1 : currentIndex - 1
          : Math.max(currentIndex - 1, 0);
        focusItem(prevIndex);
        break;

      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;

      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        if (onSelect && currentIndex >= 0) {
          event.preventDefault();
          onSelect(items[currentIndex], currentIndex);
        }
        break;

      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      default:
        // Handle alphanumeric search
        if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
          handleTypeahead(event.key.toLowerCase());
        }
        break;
    }
  }, [disabled, loop, onSelect, onEscape, focusItem]);

  const typeaheadTimeoutRef = useRef();
  const typeaheadStringRef = useRef('');

  const handleTypeahead = useCallback((char) => {
    clearTimeout(typeaheadTimeoutRef.current);
    
    typeaheadStringRef.current += char;
    
    const items = itemsRef.current;
    const searchString = typeaheadStringRef.current;
    
    // Find item that starts with the typed characters
    const matchIndex = items.findIndex((item, index) => {
      if (index <= currentIndexRef.current && searchString.length === 1) {
        return false; // Skip current and previous items for single char
      }
      
      const text = item.textContent || item.innerText || '';
      return text.toLowerCase().startsWith(searchString);
    });
    
    if (matchIndex !== -1) {
      focusItem(matchIndex);
    }
    
    // Clear typeahead string after delay
    typeaheadTimeoutRef.current = setTimeout(() => {
      typeaheadStringRef.current = '';
    }, 1000);
  }, [focusItem]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(typeaheadTimeoutRef.current);
    };
  }, []);

  return {
    handleKeyDown,
    focusItem,
    currentIndex: currentIndexRef.current,
    setCurrentIndex: (index) => {
      currentIndexRef.current = index;
    }
  };
};

// Hook for modal keyboard navigation
export const useModalKeyboardTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef?.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Let parent handle escape
        e.stopPropagation();
      }
    };

    // Focus first element when modal opens
    setTimeout(() => {
      firstElement?.focus();
    }, 0);

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, containerRef]);
};

export default useKeyboardNavigation;