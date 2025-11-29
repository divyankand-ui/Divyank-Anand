import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { signIn, signUp, resetPassword } from '../services/storageService';
import { Button } from './Button';

interface AuthFormProps {
  view: 'LOGIN' | 'SIGNUP';
  onNavigate: (view: ViewState) => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ view, onNavigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States: LOGIN | SIGNUP | FORGOT
  const [formMode, setFormMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>(view);

  const handleModeChange = (mode: 'LOGIN' | 'SIGNUP' | 'FORGOT') => {
    setFormMode(mode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (formMode === 'FORGOT') {
        await resetPassword(email);
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setLoading(false);
        return;
      }

      let user: User;
      if (formMode === 'SIGNUP') {
        user = await signUp(email, password, name);
      } else {
        user = await signIn(email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      
      {/* LEFT SIDE: Character & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-950 relative items-center justify-center overflow-hidden border-r border-slate-800">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* The "Mascot" Character (CSS/SVG Composition) */}
        <div className="relative z-10 animate-float">
            {/* Robot Body */}
            <div className="relative w-64 h-80">
                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-28 bg-slate-800 rounded-3xl border-2 border-slate-600 shadow-2xl z-20 overflow-hidden">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-12 bg-black rounded-lg flex items-center justify-center gap-2 px-2">
                        {/* Eyes */}
                        <div className="w-6 h-6 bg-brand-400 rounded-full animate-pulse-glow shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                        <div className="w-6 h-6 bg-brand-400 rounded-full animate-pulse-glow shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                    </div>
                    {/* Antenna */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-6 bg-slate-500"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>

                {/* Torso */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-40 h-40 bg-slate-700 rounded-3xl border-4 border-slate-900 shadow-xl z-10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-brand-400/20 rounded-full flex items-center justify-center border border-brand-400/30">
                        <span className="text-4xl">₹</span>
                    </div>
                </div>

                {/* Arms */}
                <div className="absolute top-28 -left-4 w-12 h-32 bg-slate-800 rounded-2xl transform rotate-12 border border-slate-600"></div>
                <div className="absolute top-28 -right-4 w-12 h-32 bg-slate-800 rounded-2xl transform -rotate-12 border border-slate-600"></div>

                {/* Hoverboard */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-12 bg-brand-400 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.6)] transform skew-x-12 flex items-center justify-center z-30">
                     <div className="w-full h-2 bg-white/30 absolute top-2 rounded-full"></div>
                </div>
                
                {/* Board Glow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 bg-brand-400/40 blur-xl rounded-full animate-pulse"></div>
            </div>
        </div>

      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 xl:px-24 bg-black relative">
        
        {/* Mobile Header (Logo) */}
        <div className="absolute top-8 left-8 lg:left-12 cursor-pointer" onClick={() => onNavigate('LANDING')}>
           <div className="flex items-center gap-3 group">
             {/* Fancy MET Logo */}
             <div className="border-2 border-slate-700 px-3 py-1 flex items-center justify-center group-hover:border-brand-400 transition-all duration-300">
                 <span className="font-serif font-black text-2xl text-white group-hover:text-brand-400 italic tracking-tighter">MET</span>
             </div>
             <span className="font-bold tracking-[0.2em] text-white text-xs sm:text-sm group-hover:text-slate-300 transition-colors">MY EXPENSE TRACKER</span>
           </div>
        </div>

        <div className="w-full max-w-sm mt-12 lg:mt-0">
            
            {/* Express Login Mock */}
            {formMode !== 'FORGOT' && (
              <>
                <div className="mb-8">
                    <p className="text-xs text-slate-500 mb-3">Express login via Google</p>
                    <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg border border-slate-800 flex items-center justify-between transition-all group disabled:opacity-50 disabled:cursor-not-allowed" disabled title="Not available in demo">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-slate-300 group-hover:text-white">Google</span>
                        </div>
                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-black px-2 text-xs text-slate-500 uppercase tracking-wider">Or continue with</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-800">
                    <button
                        onClick={() => handleModeChange('LOGIN')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                            formMode === 'LOGIN' 
                            ? 'bg-slate-800 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => handleModeChange('SIGNUP')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                            formMode === 'SIGNUP' 
                            ? 'bg-slate-800 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Sign up
                    </button>
                </div>
              </>
            )}

            {formMode === 'FORGOT' && (
              <div className="mb-6">
                 <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                 <p className="text-slate-400 text-sm">Enter your email to receive a reset link.</p>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
                {formMode === 'SIGNUP' && (
                    <div className="animate-fade-in-down">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-4 bg-slate-900 border-2 border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-0 transition-all font-medium"
                            placeholder="Full Name"
                        />
                    </div>
                )}

                <div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-900 border-2 border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-0 transition-all font-medium"
                        placeholder="email or username"
                    />
                </div>

                {formMode !== 'FORGOT' && (
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-4 bg-slate-900 border-2 border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-0 transition-all font-medium"
                            placeholder="password"
                        />
                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-white uppercase">Show</button>
                    </div>
                )}

                {error && (
                    <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                        {error}
                    </div>
                )}
                
                {successMsg && (
                    <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-lg border border-green-900/50">
                        {successMsg}
                    </div>
                )}

                <Button type="submit" className="w-full py-4 rounded-xl text-base shadow-lg shadow-brand-400/20" isLoading={loading}>
                    {formMode === 'LOGIN' ? 'Log in' : formMode === 'SIGNUP' ? 'Create Account' : 'Send Reset Link'}
                </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4 text-center">
                 {formMode === 'FORGOT' ? (
                    <button onClick={() => handleModeChange('LOGIN')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors block w-full">Back to Log in</button>
                 ) : (
                    <>
                        <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors block w-full">Log in with SSO</button>
                        <button onClick={() => handleModeChange('FORGOT')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors block w-full">Forgot password?</button>
                    </>
                 )}
                 
                 {formMode !== 'FORGOT' && (
                     <div className="pt-8 text-xs text-slate-600 font-medium">
                        Looking for <span className="underline cursor-pointer hover:text-slate-400">Facebook Login</span>?
                     </div>
                 )}
            </div>

        </div>
      </div>

    </div>
  );
};