/**
 * File: Register.tsx
 *
 * Purpose:
 * Renders the registration form page component.
 *
 * Responsibilities:
 * * Capture registration details (name, email, phone, password)
 * * Validate formats using Hook Form and Zod schemas (checking E.164 phone formats and password strength)
 * * Display validation errors and register success state
 *
 * Why this file exists:
 * To let new users onboard and create their credentials securely.
 *
 * Usage Flow:
 * User typing -> Validation -> Submit -> authService.register() -> Success UI
 *
 * Design Decisions:
 * * Schema-based validations with Zod
 */
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g. +1234567890)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@#$%^&+=!]/, 'Must contain at least one special character (@#$%^&+=!)'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Registration failed. Please verify your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10 text-center">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-accent mb-2">Registration Complete</h2>
        <p className="text-text-secondary text-sm mb-6">
          Your SkyleBank account has been set up successfully.
        </p>
        <Link
          to="/login"
          className="block w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors text-sm shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg px-6 py-8 bg-white border border-neutral-border rounded-card shadow-lg sm:px-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-accent">Create Account</h2>
        <p className="text-text-secondary text-sm mt-2">
          Join SkyleBank for intelligent security and smart banking
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-btn text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                disabled={isLoading}
                placeholder="John"
                {...register('firstName')}
                className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                  errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
                } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                disabled={isLoading}
                placeholder="Doe"
                {...register('lastName')}
                className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                  errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
                } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
              } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone className="h-5 w-5" />
            </div>
            <input
              type="tel"
              disabled={isLoading}
              placeholder="+1234567890"
              {...register('phoneNumber')}
              className={`block w-full pl-10 pr-3 py-2 bg-neutral-light border ${
                errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-neutral-border focus:border-primary focus:ring-primary-light'
              } rounded-btn focus:outline-none focus:ring-2 text-sm transition-all`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Password
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-btn transition-colors shadow-md disabled:opacity-50 text-sm mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-text-secondary text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
