// Referral tracking utility
const REFERRAL_KEY = 'bf_suma_referral';
const REFERRAL_EXPIRY_KEY = 'bf_suma_referral_expiry';
const REFERRAL_EXPIRY_DAYS = 30;

export const setReferralCode = (code: string) => {
  try {
    localStorage.setItem(REFERRAL_KEY, code);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS);
    localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
    console.log('Referral code set:', code);
  } catch (error) {
    console.error('Error setting referral code:', error);
  }
};

export const getReferralCode = (): string | null => {
  try {
    const code = localStorage.getItem(REFERRAL_KEY);
    const expiry = localStorage.getItem(REFERRAL_EXPIRY_KEY);
    
    if (!code || !expiry) {
      return null;
    }
    
    // Check if referral has expired
    const expiryDate = new Date(expiry);
    if (expiryDate < new Date()) {
      clearReferralCode();
      return null;
    }
    
    return code;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
};

export const clearReferralCode = () => {
  try {
    localStorage.removeItem(REFERRAL_KEY);
    localStorage.removeItem(REFERRAL_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing referral code:', error);
  }
};
