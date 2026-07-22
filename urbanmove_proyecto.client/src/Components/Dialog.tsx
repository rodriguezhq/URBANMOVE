import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import React, { createContext, useContext, type ReactNode, useState, useRef, useId, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import AppButton, { type AppButtonProps } from './AppButton';

interface DialogContextType {
    onClose: () => void;
    dialogId: string;
    headerId: string;
    contentId: string;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialogContext = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialogContext must be used within a DialogProvider');
    }
    return context;
};


// -------------------------------------- Variantes de estilo
const backdropVariants = cva(
    'fixed inset-0 transition-opacity duration-300 ease-out',
    {
        variants: {
            scrollLock: {
                true: 'bg-black/40',
                false: 'bg-transparent pointer-events-none',
            },
            state: {
                open: 'opacity-100',
                closed: 'opacity-0 pointer-events-none',
            },
        },
        defaultVariants: {
            scrollLock: true,
            state: 'closed',
        },
    }
);

const dialogPanelVariants = cva(
    [
        'fixed z-50 text-neutral-800 bg-white rounded-none shadow-lg starting:scale-70 starting:opacity-0 p-6',
        'flex flex-col gap-3',
        'border border-black/10',
        'transition-all',
        'max-h-[90vh] w-fit max-w-[95vw]',
        'focus:outline-none',
    ],
    {
        variants: {
            position: {
                top: 'top-5 left-1/2 -translate-x-1/2 items-start',
                center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
                bottom: 'bottom-5 left-1/2 -translate-x-1/2 items-end',
            },
            state: {
                open: 'opacity-100 scale-100 duration-300 ease-out',
                closed: 'opacity-0 scale-70 pointer-events-none duration-100 ease-in',
            },
        },
        defaultVariants: {
            position: 'center',
            state: 'closed',
        },
    }
);

//------------------------------ Componentes

export interface DialogProps extends VariantProps<typeof dialogPanelVariants> {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    scrollLock?: boolean;
    /**
     * Si es `true`, el diálogo no se cerrará al hacer clic fuera de él o al presionar la tecla Escape.
     * @default false
     */
    persistOnBlur?: boolean;
    initialFocusRef?: React.RefObject<HTMLElement>;
    containerClassName?: string;
    backdropClassName?: string;
    panelClassName?: string;
}

const DialogRoot = ({
    isOpen,
    onClose,
    children,
    position,
    scrollLock = true,
    persistOnBlur = false,
    initialFocusRef,
    containerClassName,
    backdropClassName,
    panelClassName,
}: DialogProps) => {
    const [mounted, setMounted] = useState(isOpen);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

    const uniqueId = useId();
    const dialogId = `dialog-${uniqueId}`;
    const headerId = `dialog-header-${uniqueId}`;
    const contentId = `dialog-content-${uniqueId}`;

    const handleClose = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
            if (scrollLock) document.body.style.overflow = 'hidden';
        } else {
            if (scrollLock) document.body.style.overflow = '';
            previouslyFocusedElementRef.current?.focus();
        }
        return () => {
            if (scrollLock) document.body.style.overflow = '';
        };
    }, [isOpen, scrollLock]);

    if (!mounted) return null;
    const animationState = isOpen ? 'open' : 'closed';

    const dialogContent = (
        <DialogContext.Provider value={{ onClose: handleClose, dialogId, headerId, contentId }}>
            <div
                className={twMerge("fixed inset-0 flex justify-center items-center z-50", containerClassName)}
            >
                {/* Backdrop */}
                <div
                    className={twMerge(
                        backdropVariants({ scrollLock, state: animationState }),
                        backdropClassName
                    )}
                    onClick={!persistOnBlur ? handleClose : undefined}
                    aria-hidden="true"
                />
                <article
                    className={twMerge(
                        dialogPanelVariants({ position, state: animationState }),
                        panelClassName
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={headerId}
                    aria-describedby={contentId}
                    tabIndex={-1}
                    id={dialogId}
                >
                    {children}
                </article>
            </div>
        </DialogContext.Provider>
    );

    if (typeof document !== 'undefined') {
        return createPortal(dialogContent, document.body);
    }
    return null;
};


interface DialogTriggerProps extends AppButtonProps { }

const DialogTrigger = ({ children, onClick, ...props }: DialogTriggerProps) => {
    const { onClose } = useDialogContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        onClose();
    };

    return (
        <AppButton
            onClick={handleClick}
            {...props}
        >
            {children}
        </AppButton>
    );
}


// --- Dialog.Header ---
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    showCloseButton?: boolean
    showContentSeparator?: boolean
    type?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
}
const DialogHeader = ({ children, className, showCloseButton = false, showContentSeparator = false, type = 'neutral', ...props }: DialogHeaderProps) => {
    const { onClose, headerId } = useDialogContext();
    return (
        <>
            <header
                id={headerId}
                className={twMerge(
                    "shrink-0 w-full text-xl font-semibold ",
                    "relative",
                    type === 'neutral' && 'text-neutral-800',
                    type === 'brand' && 'text-brand-80',
                    type === 'success' && 'text-green-600',
                    type === 'warning' && 'text-yellow-600',
                    type === 'danger' && 'text-red-600',
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <AppButton appearance='outline' onClick={onClose} className='absolute top-1/2 -translate-y-1/2 right-2'>
                        <X size={24} />
                    </AppButton>
                )}
            </header>
            {showContentSeparator && <hr className='border-neutral-200' />}
        </>
    );
};

// --- Dialog.Content ---
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
const DialogContent = ({ children, className, ...props }: DialogContentProps) => {
    const { contentId } = useDialogContext();
    return (
        <div
            id={contentId}
            className={twMerge(
                "flex-grow overflow-y-auto text-sm font-normal py-0.5 w-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// --- Dialog.Footer ---
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
const DialogFooter = ({ children, className, ...props }: DialogFooterProps) => {
    return (
        <footer
            className={twMerge(
                "shrink-0 w-full pt-2",
                "flex items-center justify-end gap-2",
                className
            )}
            {...props}
        >
            {children}
        </footer>
    );
};

// Asignar subcomponentes al componente principal
export const Dialog = Object.assign(DialogRoot, {
    Header: DialogHeader,
    Content: DialogContent,
    Footer: DialogFooter,
    Trigger: DialogTrigger,
});