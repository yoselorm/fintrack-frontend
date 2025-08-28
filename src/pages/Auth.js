import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { clearError, loginUser, signupUser } from '../redux/AuthSlice';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const Auth = () => {
  const [authView, setAuthView] = useState('login'); 
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  useEffect(() => {
    setAuthError('');
    setAuthSuccess('');
  }, [authView]);

  useEffect(() => {
    if (signupForm.confirmPassword) {
      setPasswordMatch(signupForm.password === signupForm.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [signupForm.password, signupForm.confirmPassword]);

  const validateSignupForm = () => {
    if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
      setAuthError('Please enter both first and last name');
      return false;
    }
    if (signupForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return false;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return false;
    }
    if (!signupForm.email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser(loginForm));
      
      if (loginUser.fulfilled.match(result)) {
        setAuthSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setAuthError(result.payload?.message || 'Invalid login credentials. Please check your email and password.');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    dispatch(clearError());

    try {
      const result = await dispatch(signupUser(signupForm));
      
      if (signupUser.fulfilled.match(result)) {
        setAuthSuccess('Account created successfully! Welcome to FinanceApp. Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setAuthError(result.payload?.message || 'Signup failed. Please check your information and try again.');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const switchToSignup = () => {
    setAuthView('signup');
    setLoginForm({ email: '', password: '' });
  };

  const switchToLogin = () => {
    setAuthView('login');
    setSignupForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">FinTrack</h1>
          <p className="text-gray-600">Manage your finances with AI-powered insights</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {authView === 'login' ? (
            <>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <LogIn className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="demo@financeapp.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {authSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">{authSuccess}</p>
                  </div>
                )}

                {authError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || authSuccess}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : authSuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={switchToSignup}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={switchToLogin}
                  className="mr-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="John"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Doe"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="john@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Minimum 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white ${
                        !passwordMatch ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Repeat your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {!passwordMatch && signupForm.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter referral code for $10 bonus"
                    value={signupForm.referralCode}
                    onChange={(e) => setSignupForm({ ...signupForm, referralCode: e.target.value })}
                  />
                </div>

                {authSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">{authSuccess}</p>
                  </div>
                )}

                {authError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{authError}</p>
                  </div>
                )}

                {signupForm.referralCode && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                    <div className="text-green-500 mr-3 mt-0.5">🎉</div>
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Awesome!</span> You'll receive a $10 welcome bonus when you complete signup with code: <span className="font-mono bg-green-100 px-2 py-1 rounded">{signupForm.referralCode}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || authSuccess || !passwordMatch}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : authSuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={switchToLogin}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth;