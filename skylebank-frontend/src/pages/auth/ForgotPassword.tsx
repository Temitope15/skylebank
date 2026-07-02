/**
 * File: ForgotPassword.tsx
 *
 * Purpose:
 * Renders the Forgot Password recovery email submission page.
 *
 * Responsibilities:
 * * Capture recovery email input
 * * Validate email formatting locally using Hook Form and Zod schemas
 * * Handle success/failure states and links back to login
 *
 * Why this file exists:
 * To provide a secure interface for requesting a password reset link.
 *
 * Usage Flow:
 * User typing -> Validation -> Submit -> authService.forgotPassword() -> Success Banner
 *
 * Design Decisions:
 * * Schema-based validations with Zod
 */
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'An error occurred. Please check your email and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-accent">Reset Password</h2>
        <p className="text-text-secondary text-sm mt-2">
          Enter your email to receive a secure password reset link
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center py-4 flex flex-col items-center">
          <div className="flex justify-center mb-4 text-green-500 bg-green-50 p-3 rounded-full border border-green-100">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-accent mb-2 font-heading">Email Sent</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-sm">
            Please check your inbox (and spam folder) for the password reset link.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors text-sm shadow-md"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-btn text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  disabled={isLoading}
                  placeholder="john.doe@example.com"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                    errors.email ? 'border-red-500' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
                  } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
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
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
