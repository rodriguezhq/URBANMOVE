import { type ReactNode, createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, OctagonAlert, Sparkles, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import { useTwBreakpoint } from '../Hooks/useViewport';

const MAX_TOASTS = 5;
let toastIdCounter = 0;

const toastVariants = cva(
  'relative @container border shadow-xl min-h-10 rounded p-2 w-96 text-sm',
  {
    variants: {
      type: {
        success: 'border-green-600  bg-green-500 text-white',
        danger: 'border-red-600 bg-red-500 text-white',
        warning: 'border-yellow-600  bg-yellow-500 text-white',
        neutral: 'border-neutral-200  bg-neutral-50 text-black ',
        brand: 'border-violet-600 bg-violet-500 text-white',
      },
      showIcon: {
        true: 'grid grid-cols-[28px_1fr] items-center',
        false: 'flex items-center gap-2'
      }
    },
    defaultVariants: {
      type: 'neutral',
      showIcon: true
    },
  }
);

type ToastType = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
type ToastPosition = 'top' | 'bottom' | 'left' | 'right' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

const positionStyles: Record<string, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  left: 'top-1/2 left-4 -translate-y-1/2 flex-col',
  right: 'top-1/2 right-4 -translate-y-1/2 flex-col',
  'left-start': 'top-4 left-4 flex-col-reverse',
  'left-end': 'bottom-4 left-4 flex-col',
  'right-start': 'top-4 right-4 flex-col-reverse',
  'right-end': 'bottom-4 right-4 flex-col',
};

const toastIconClasses: Record<ToastType, string> = {
  success: 'text-white',
  danger: 'text-white',
  warning: 'text-white',
  neutral: 'text-black',
  brand: 'text-white',
};

type Toast = {
  id: string;
  type: ToastType;
  component: ReactNode;
  time: number | 'manual';
  isClosable: boolean;
  position: ToastPosition;
  showIcon?: boolean;
  onClose?: () => void;
};

type NotifyOptions = Omit<Toast, 'id'>;

type ToastContextType = {
  notify: (options: NotifyOptions) => string;
  close: (id: string) => void;
  showSuccess: (message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => string;
  showDanger: (message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => string;
  showWarning: (message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => string;
  showNeutral: (message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => string;
  showBrand: (message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => string;
};

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export const useNotification = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { sm: isDesktop } = useTwBreakpoint();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const close = useCallback((id: string) => {
    setToasts((prevToasts) => {
      const toastToRemove = prevToasts.find(toast => toast.id === id);
      if (toastToRemove?.onClose) {
        toastToRemove.onClose();
      }
      return prevToasts.filter((toast) => toast.id !== id);
    });

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (options: NotifyOptions) => {
      let {
        time = 3000,
        isClosable = true,
        position = 'top',
        showIcon = true,
        ...rest
      } = options;

      const id = `toast-${Date.now()}-${toastIdCounter++}`;
      const newToast: Toast = { id, time, isClosable, position, showIcon, ...rest };

      setToasts((prevToasts) => {
        const toastsInPosition = prevToasts.filter(t => t.position === position);
        if (toastsInPosition.length >= MAX_TOASTS) {
          const oldestToastId = toastsInPosition[0].id;
          const timer = timersRef.current.get(oldestToastId);
          if (timer) clearTimeout(timer);
          timersRef.current.delete(oldestToastId);
          return [...prevToasts.filter(t => t.id !== oldestToastId), newToast];
        }
        return [...prevToasts, newToast];
      });

      if (typeof time === 'number') {
        const timer = setTimeout(() => close(id), time);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [close]
  );

  const showSuccess = useCallback((message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => {
    return notify({
      type: 'success',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
    });
  }, [notify]);

  const showDanger = useCallback((message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => {
    return notify({
      type: 'danger',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
    });
  }, [notify]);

  const showWarning = useCallback((message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => {
    return notify({
      type: 'warning',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
    });
  }, [notify]);

  const showNeutral = useCallback((message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => {
    return notify({
      type: 'neutral',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
    });
  }, [notify]);

  const showBrand = useCallback((message: string, options?: Omit<NotifyOptions, 'type' | 'component'>) => {
    return notify({
      type: 'brand',
      component: <p>{message}</p>,
      isClosable: options?.isClosable ?? true,
      time: options?.time ?? 5000,
      position: options?.position ?? 'top',
      showIcon: options?.showIcon ?? true,
    });
  }, [notify]);

  const contextValue = useMemo(() => (
    {
      notify,
      close,
      showSuccess,
      showDanger,
      showWarning,
      showNeutral,
      showBrand,
    }
  ), [notify, close, showSuccess, showDanger, showWarning, showNeutral, showBrand]);

  const groupedToasts = useMemo(() => {
    return toasts.reduce<Record<ToastPosition, Toast[]>>((acc, toast) => {
      acc[toast.position] = acc[toast.position] || [];
      acc[toast.position].push(toast);
      return acc;
    }, {} as Record<ToastPosition, Toast[]>);
  }, [toasts]);

  const renderIcon = (type: ToastType) => {
    const icons: Record<ToastType, ReactNode> = {
      success: <CheckCircle2 size={20} className={toastIconClasses[type]} />,
      danger: <OctagonAlert size={20} className={toastIconClasses[type]} />,
      warning: <AlertTriangle size={20} className={toastIconClasses[type]} />,
      neutral: <Info size={20} className={toastIconClasses[type]} />,
      brand: <Bell size={20} className={toastIconClasses[type]} />,
    };
    return icons[type];
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {Object.keys(positionStyles).map((position) => {
        const items = groupedToasts[position as ToastPosition] || [];

        const getPositionClasses = () => {
          if (isDesktop) {
            return positionStyles[position];
          }
          // Lógica para móvil
          const isTopAligned = position.endsWith('-start') || position === 'top';
          if (isTopAligned) {
            return 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse';
          }
          // Todas las demás posiciones (bottom, -end, left, right) van abajo
          return 'bottom-4 left-1/2 -translate-x-1/2 flex-col';
        };

        return (
          <div
            key={position}
            className={twMerge(
              'fixed z-100 flex gap-2 items-center pointer-events-none',
              getPositionClasses()
            )}
          >
            {items.map(({ id, component, type, isClosable, showIcon }) => (
              <div
                key={id}
                className={twMerge('pointer-events-auto transition-all duration-200 ease-out', toastVariants({ type, showIcon }))}
              >
                {showIcon && renderIcon(type)}

                <div className={twMerge("flex-1", isClosable && "mr-5")}>{component}</div>

                {isClosable && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded p-1 hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => close(id)}
                    aria-label="Cerrar notificación"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </ToastContext.Provider >
  );
};