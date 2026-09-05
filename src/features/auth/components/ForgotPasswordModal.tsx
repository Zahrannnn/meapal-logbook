import React from 'react';
import { X, Mail, KeyRound, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForgotPasswordFlow } from '../hooks';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const {
    step,
    setStep,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    handleClose,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
  } = useForgotPasswordFlow(onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(event) => event.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {step === 'email' && 'Forgot Password'}
                    {step === 'otp' && 'Verify OTP'}
                    {step === 'password' && 'Reset Password'}
                    {step === 'success' && 'Success!'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {step === 'email' && 'Enter your email to receive a reset code'}
                    {step === 'otp' && 'Enter the code sent to your email'}
                    {step === 'password' && 'Create your new password'}
                    {step === 'success' && 'Your password has been reset'}
                  </p>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="your.email@ricoh.com" required disabled={isLoading} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Sending...</> : 'Send Reset Code'}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={otp} onChange={(event) => setOtp(event.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center text-2xl tracking-widest" placeholder="000000" maxLength={6} required disabled={isLoading} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Code sent to {email}</p>
                  </div>
                  <button type="submit" disabled={isLoading || otp.length < 6} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Verifying...</> : 'Verify Code'}
                  </button>
                  <button type="button" onClick={() => setStep('email')} className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm">
                    ← Back to email
                  </button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="••••••••" required disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none" placeholder="••••••••" required disabled={isLoading} />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Resetting...</> : 'Reset Password'}
                  </button>
                </form>
              )}

              {step === 'success' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successfully!</h3>
                  <p className="text-gray-600 mb-6">You can now log in with your new password.</p>
                  <button onClick={handleClose} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
