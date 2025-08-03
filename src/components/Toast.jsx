import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#374151',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#ffffff',
          },
        },
        loading: {
          style: {
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#ea580c',
            border: '1px solid rgba(249, 115, 22, 0.2)',
          },
        },
      }}
    />
  );
};

export default Toast; 