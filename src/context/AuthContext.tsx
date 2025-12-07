import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/auth';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let userSubscription: any = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          if (session) {
            try {
              // Check users table for role
              const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching user:', error);
                setState({
                  user: null,
                  loading: false,
                  error: null,
                });
              } else if (userData) {
                // Transform database fields to User interface
                const user: User = {
                  id: userData.id,
                  email: userData.email,
                  role: userData.role || 'user',
                  accountBalance: userData.account_balance || 0,
                  investmentBalance: userData.investment_balance || 0,
                  status: userData.status || 'active'
                };
                console.log('User loaded:', user);
                setState({
                  user: user,
                  loading: false,
                  error: null,
                });

                // Unsubscribe from previous user subscription if it exists
                if (userSubscription) {
                  userSubscription.unsubscribe();
                }

                // Subscribe to real-time updates on this user's data
                userSubscription = supabase
                  .channel(`user:${session.user.id}`)
                  .on(
                    'postgres_changes',
                    {
                      event: 'UPDATE',
                      schema: 'public',
                      table: 'users',
                      filter: `id=eq.${session.user.id}`,
                    },
                    (payload: any) => {
                      console.log('User data updated:', payload);
                      const updatedUser: User = {
                        id: payload.new.id,
                        email: payload.new.email,
                        role: payload.new.role || 'user',
                        accountBalance: payload.new.account_balance || 0,
                        investmentBalance: payload.new.investment_balance || 0,
                        status: payload.new.status || 'active'
                      };
                      setState(prev => ({
                        ...prev,
                        user: updatedUser
                      }));
                    }
                  )
                  .subscribe();
              } else {
                setState({
                  user: null,
                  loading: false,
                  error: null,
                });
              }
            } catch (err) {
              console.error('Unexpected error:', err);
              setState({
                user: null,
                loading: false,
                error: null,
              });
            }
          } else {
            // User logged out
            if (userSubscription) {
              userSubscription.unsubscribe();
              userSubscription = null;
            }
            setState({
              user: null,
              loading: false,
              error: null,
            });
          }
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
      if (userSubscription) {
        userSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch user data to determine role from users table
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Check users table for role - force fresh read
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        const role = userData?.role || 'user';
        
        console.log('Sign in - User role:', role, 'Email:', email);
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign in';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      // Fetch user data to determine role
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        const role = userData?.role || 'user';
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } else {
      setState({ user: null, loading: false, error: null });
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}