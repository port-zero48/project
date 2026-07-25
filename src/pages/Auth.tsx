import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [isSignIn, setIsSignIn] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') !== 'signup';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsSignIn(params.get('mode') !== 'signup');
  }, [location.search]);

  const handleSignIn = async (email: string, password: string) => {
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsSubmitting(true);

    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Sign up failed:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 py-10">
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <p className="mt-4 text-lg font-semibold text-white">
              {isSignIn ? 'Signing you in...' : 'Creating your account...'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Please wait while your account is being prepared.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h2>
        </div>

        {isSignIn ? (
          <SignInForm onSubmit={handleSignIn} isSubmitting={isSubmitting} />
        ) : (
          <SignUpForm onSubmit={handleSignUp} isSubmitting={isSubmitting} />
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isSignIn
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}