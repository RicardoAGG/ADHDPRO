import React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';

export const ToastProvider = ToastPrimitives.Provider;
export const ToastViewport = ToastPrimitives.Viewport;

export const Toast = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={`bg-white rounded-md shadow-lg p-4 ${className}`}
    {...props}
  />
));

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={`font-medium ${className}`}
    {...props}
  />
));

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={`mt-1 ${className}`}
    {...props}
  />
));

export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(({ title, description, duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, title, description, duration }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return { toast, toasts };
}