/**
 * @file RegistrationForm Component
 * @description User registration form for account creation in Phase 3A.
 *              Collects email, password, and basic profile information.
 *
 * @see {@link _docs/user-flow.md} Phase 3A: Account Creation
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Registration form validation schema
 * HIPAA-compliant password requirements
 */
const registrationSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(
        /[@$!%*?&\-_]/,
        'Password must contain a special character (@$!%*?&-_)'
      ),
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\d\s\-().+]+$/.test(val),
        'Please enter a valid phone number'
      ),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * RegistrationForm component props
 */
interface RegistrationFormProps {
  /** User type from Phase 0 selection */
  userType: string;
  /** Submit handler */
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * User registration form with validation
 *
 * @param props - Component props
 */
export function RegistrationForm({
  userType,
  onSubmit,
  className,
}: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const password = watch('password');

  // Password strength indicators
  const hasLength = password?.length >= 12;
  const hasLowercase = /[a-z]/.test(password || '');
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[@$!%*?&\-_]/.test(password || '');

  async function handleFormSubmit(data: RegistrationFormData) {
    await onSubmit(data);
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Name fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="Jane"
            {...register('firstName')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            {...register('lastName')}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          className={cn(errors.email && 'border-destructive')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone Number <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          {...register('phone')}
          className={cn(errors.phone && 'border-destructive')}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          For appointment reminders and updates
        </p>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a secure password"
            {...register('password')}
            className={cn(errors.password && 'border-destructive', 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password requirements */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <PasswordRequirement met={hasLength} text="12+ characters" />
          <PasswordRequirement met={hasLowercase} text="Lowercase letter" />
          <PasswordRequirement met={hasUppercase} text="Uppercase letter" />
          <PasswordRequirement met={hasNumber} text="Number" />
          <PasswordRequirement met={hasSpecial} text="Special character" />
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="passwordConfirmation" className="text-sm font-medium">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="passwordConfirmation"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            {...register('passwordConfirmation')}
            className={cn(
              errors.passwordConfirmation && 'border-destructive',
              'pr-10'
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.passwordConfirmation && (
          <p className="text-sm text-destructive">
            {errors.passwordConfirmation.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-center text-muted-foreground">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

/**
 * Password requirement indicator
 */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs transition-colors',
        met ? 'text-success' : 'text-muted-foreground'
      )}
    >
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors',
          met ? 'bg-success' : 'bg-muted-foreground/30'
        )}
      />
      {text}
    </div>
  );
}

