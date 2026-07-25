import { useState } from 'react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function SignUpForm({ onSubmit, isSubmitting }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>
      {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors"
      >
        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}