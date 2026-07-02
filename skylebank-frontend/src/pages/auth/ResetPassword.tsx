/**
 * File: ResetPassword.tsx
 *
 * Purpose:
 * Renders the Define Password form screen for resetting a lost password.
 *
 * Responsibilities:
 * * Capture new password and confirmation inputs
 * * Extract recovery token from URL query parameters
 * * Enforce password complexity schemas and match constraints using Hook Form/Zod
 *
 * Why this file exists:
 * To provide a secure interface to update credentials via a validated email reset link.
 *
 * Usage Flow:
 * User opens URL ?token=XYZ -> local token verification -> form submission -> authService.resetPassword() -> Success Page
 *
 * Design Decisions:
 * * Schema-based validations with Zod
 */
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@#$%^&+=!]/, 'Must contain at least one special character (@#$%^&+=!)'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError('Verification token is missing from the link URL');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Reset token is invalid or has expired. Please request a new password reset.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10 text-center">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-accent mb-2">Password Updated</h2>
        <p className="text-text-secondary text-sm mb-6">
          Your security credentials have been updated successfully.
        </p>
        <Link
          to="/login"
          className="block w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors text-sm shadow-md"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-accent">Define Password</h2>
        <p className="text-text-secondary text-sm mt-2">
          Enter a new secure password for your account
        </p>
      </div>

      {!token && (
        <div className="p-3 mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-btn text-sm text-center font-medium">
          Warning: Reset token parameter is missing from the URL. Please verify your link.
        </div>
      )}

      {error && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-btn text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading}
              placeholder="••••••••"
              {...register('password')}
              className={`block w-full pl-10 pr-10 py-2 bg-neutral-light border ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
              } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
              } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors shadow-md disabled:opacity-50 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Updating Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
