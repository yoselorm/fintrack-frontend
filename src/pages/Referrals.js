import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Gift, TrendingUp, Share2, Copy, Check, User, X, Facebook, LinkedinIcon, FacebookIcon, Twitter } from 'lucide-react';
import { fetchReferralData } from '../redux/ReferralDataSlice';

const Referrals = () => {
  const dispatch = useDispatch();
  const { 
    referralCode, 
    totalReferrals, 
    totalRewards, 
    referredUsers, 
    loading, 
    error 
  } = useSelector((state) => state.referral);
  
  const { user } = useSelector((state) => state.auth);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchReferralData());
  }, [dispatch]);

  const copyReferralCode = async () => {
    try {
      const message = `Join me on FinTrack! Use my referral code: ${referralCode}`;
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code');
      // here adey do some fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `Join me on FinTrack! Use my referral code: ${referralCode}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed');
      }
      document.body.removeChild(textArea);
    }
  };

  const shareToSocial = (platform) => {
    const message = `Join me on FinTrack and get $10 bonus! Use code: ${referralCode}`;
    const url = `https://fintrack.com/signup?ref=${referralCode}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const copyReferralLink = async () => {
    try {
      const url = `https://fintrack.com/signup?ref=${referralCode}`;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 mb-4">Error loading referral data: {error}</p>
            <button
              onClick={() => dispatch(fetchReferralData())}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-gray-600">Earn $10 for every friend you refer to FinTrack!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
            <p className="text-sm text-gray-600">Total Referrals</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">${totalRewards}</p>
            <p className="text-sm text-gray-600">Rewards Earned</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">$10</p>
            <p className="text-sm text-gray-600">Per Referral</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white mb-8">
          <h3 className="text-xl font-semibold mb-4">Share & Earn $10</h3>
          <p className="text-indigo-100 mb-4">
            Invite friends to join FinTrack and you both get $10 when they sign up!
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-sm text-indigo-200 mb-2">Your Referral Code:</p>
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3 mb-3">
              <code className="text-lg font-mono font-bold">{referralCode}</code>
              <button
                onClick={copyReferralCode}
                className="ml-4 bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                aria-label="Copy referral code"
              >
                {copySuccess ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            
            <p className="text-sm text-indigo-200 mb-2">Referral Link:</p>
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="text-sm font-mono truncate mr-2">
                https://fintrack.com/signup?ref={referralCode}
              </span>
              <button
                onClick={copyReferralLink}
                className="ml-2 bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors flex-shrink-0"
                aria-label="Copy referral link"
              >
                {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => shareToSocial('twitter')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Twitter className="h-4 w-4 mr-2" />
              X
            </button>
            <button
              onClick={() => shareToSocial('facebook')}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FacebookIcon className="h-4 w-4 mr-2" />
              Facebook
            </button>
            <button
              onClick={() => shareToSocial('linkedin')}
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <LinkedinIcon className="h-4 w-4 mr-2" />
              LinkedIn
            </button>
            <button
              onClick={() => shareToSocial('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              WhatsApp
            </button>
          </div>

          {copySuccess && (
            <div className="mt-4 bg-green-500/20 border border-green-400/30 rounded-lg p-3">
              <p className="text-green-100 text-sm flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Copied to clipboard!
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Share Your Code</h4>
              <p className="text-sm text-gray-600">Share your unique referral code with friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Friend Signs Up</h4>
              <p className="text-sm text-gray-600">They create an account using your referral code</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Both Get $10</h4>
              <p className="text-sm text-gray-600">You both receive $10 credit in your accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referrals</h3>
            {referredUsers && referredUsers.length > 0 ? (
              <div className="space-y-3">
                {referredUsers.map((referredUser, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {referredUser.firstName} {referredUser.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(referredUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold">
                      +$10
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No referrals yet</p>
                <p className="text-sm text-gray-400">Start sharing your code to earn rewards!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;