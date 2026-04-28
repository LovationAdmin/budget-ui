// src/components/ui/password-input.tsx
// ============================================================================
// 🎯 PasswordInput — Show/hide toggle, replaces "confirm password" pattern
// ============================================================================
// Fixes P1 #9. Modern UX: ditch confirmPassword (last accepted ~2018).
// Used by Login.tsx and Signup.tsx.
//
// Accessibility:
//   - aria-pressed on the toggle button
//   - aria-label that announces the current state
//   - the focus ring stays on the input itself
// ============================================================================

import { forwardRef, useState, ComponentPropsWithoutRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface PasswordInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  /** Show or hide the toggle (defaults to true) */
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(showToggle ? 'pr-11' : '', className)}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            aria-pressed={visible}
            aria-label={
              visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            onClick={() => setVisible((v) => !v)}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted-foreground hover:bg-accent hover:text-foreground',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]'
            )}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
