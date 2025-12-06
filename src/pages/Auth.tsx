import { useState } from 'react';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h2>
        </div>
        
        {isSignIn ? <SignInForm /> : <SignUpForm />}
        
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