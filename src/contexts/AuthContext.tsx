import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUnifiedToast } from '@/hooks/use-unified-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: string[];
  isAdmin: boolean;
  isModerator: boolean;
  refetchRoles: () => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { showToast } = useUnifiedToast();

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      setUserRoles(data?.map(r => r.role) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        showToast({
          title: "Errore di accesso",
          description: error.message,
          type: 'error'
        });
      } else {
        toast({
          title: "Accesso effettuato",
          description: `Benvenuto in PetVoice${user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name.split(' ')[0]}` : ''}!`,
        });
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Check if email already exists
      const { data: emailExists } = await supabase.rpc('check_email_exists', { 
        email_to_check: email 
      });
      
      if (emailExists) {
        const errorMessage = 'Un account con questa email esiste già. Prova ad accedere invece.';
        toast({
          title: "Email già registrata",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: { message: errorMessage, isEmailExists: true } };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            
          }
        }
      });
      
      if (error) {
        showToast({
          title: "Errore di registrazione", 
          description: error.message,
          type: 'error'
        });
        
        return { error };
      } else {
        toast({
          title: "Registrazione completata",
          description: "Controlla la tua email per confermare l'account.",
        });
        
        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: "Errore di registrazione",
        description: "Si è verificato un errore durante la registrazione. Riprova.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Disconnesso",
          description: "A presto su PetVoice!",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email inviata",
          description: "Controlla la tua email per reimpostare la password.",
        });
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const isAdmin = userRoles.includes('admin');
  const isModerator = userRoles.includes('moderator');

  const refetchRoles = () => {
    if (user) {
      fetchUserRoles(user.id);
    }
  };

  const value = {
    user,
    session,
    loading,
    userRoles,
    isAdmin,
    isModerator,
    refetchRoles,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};