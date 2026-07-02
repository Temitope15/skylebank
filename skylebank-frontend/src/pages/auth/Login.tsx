/**
 * File: Login.tsx
 *
 * Purpose:
 * Renders the Login page component for authentication entry.
 *
 * Responsibilities:
 * * Capture email and password inputs
 * * Validate formats locally using React Hook Form and Zod schemas
 * * Handle login error alerts and redirect upon successful session initialization
 *
 * Why this file exists:
 * To provide a secure interface for registered user login.
 *
 * Usage Flow:
 * User typing -> Validation -> Submit -> authService.login() -> /dashboard redirect
 *
 * Design Decisions:
 * * Schema-based validations with Zod
 */
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-accent">Welcome Back</h2>
        <p className="text-text-secondary text-sm mt-2">
          Securely log in to manage your digital vault
        </p>
      </div>

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
              placeholder="name@example.com"
              {...register('email')}
              className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
              } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-semibold text-text-primary">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors shadow-md disabled:opacity-50 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verifying Credentials...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}
