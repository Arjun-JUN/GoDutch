import React, { createContext, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast } from './Toast';
import type { ToastData, ToastType } from './Toast';
import { zIndex } from '../tokens/z-index';

type ShowOptions = {
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  show: (message: string, options?: ShowOptions) => void;
};

export const ToastContext = createContext<ToastContextValue>({ show: () => {} });

type Props = { children: React.ReactNode };

export function ToastProvider({ children }: Props) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback((message: string, options?: ShowOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type: options?.type ?? 'info', duration: options?.duration ?? 3000 }]);
  }, []);

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.overlay} pointerEvents="none">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onHide={hide} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.toast,
  },
});
