import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, upsertProfile, getProfile } from '../utils/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Generate a unique referral code for a user
function generateReferralCode(email) {
  return btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isPremium = profile?.is_premium || false;
  const referralsCount = profile?.referrals_count || 0;

  // Load session and profile on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.email);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.email);
        setIsAuthModalOpen(false);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (email) => {
    const { data } = await getProfile(email);
    if (data) {
      setProfile(data);
    } else {
      // Create a new profile if one doesn't exist yet
      const referralCode = generateReferralCode(email);
      const newProfile = { email, is_premium: false, referrals_count: 0, referral_code: referralCode };
      await upsertProfile(newProfile);
      setProfile(newProfile);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // For local testing: simulate a referral signup counting up
  const simulateReferralSignup = async () => {
    const newCount = referralsCount + 1;
    const updatedProfile = { 
      ...profile, 
      referrals_count: newCount,
      is_premium: newCount >= 3,
    };
    setProfile(updatedProfile);
    if (user) {
      await upsertProfile(updatedProfile);
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    profile,
    isPremium,
    referralsCount,
    loading,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    logout,
    simulateReferralSignup,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
