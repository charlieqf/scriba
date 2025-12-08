import React, { useState } from 'react';
import { AppleIcon, GoogleIcon, FacebookIcon } from '../components/icons';
import { authService } from '../services/authService';
import { ArrowLeft, ScanFace } from 'lucide-react';

// --- Types & Interfaces ---
type AuthStep = 'landing' | 'email_entry' | 'login_password' | 'signup_password';

interface SocialButtonProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'outline' | 'black' | 'blue' | 'teal' | 'ghost' | 'tealSoft';
  className?: string;
}

// --- Components ---

// Reusable Button Component
const SocialButton: React.FC<SocialButtonProps> = ({ icon, label, onClick, variant = 'outline', className = '' }) => {
  const baseStyles = "w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-full font-semibold text-[15px] transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    black: "bg-slate-900 text-white hover:bg-slate-800 border border-transparent",
    blue: "bg-[#1877F2] text-white hover:bg-[#166fe5] border border-transparent",
    teal: "bg-teal-600 text-white hover:bg-teal-700 border border-transparent shadow-lg shadow-teal-600/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
    tealSoft: "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {icon && <div className="w-5 h-5 flex items-center justify-center">{icon}</div>}
      <span>{label}</span>
    </button>
  );
};

// Input Component
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
  />
);

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('landing');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enableFaceId, setEnableFaceId] = useState(false);

  // --- Handlers ---

  const handleSocialLogin = async (provider: string, loginFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await loginFn();
      if (result.success) {
        console.log('Logged in user:', result.user);
        alert(`Successfully logged in with ${provider === 'face_id' ? 'Face ID' : provider}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const exists = await authService.checkEmail(email);
      if (exists) {
        setStep('login_password');
      } else {
        setStep('signup_password');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalAuth = async () => {
    if (!password) return;
    setLoading(true);
    try {
      let result;
      if (step === 'login_password') {
        result = await authService.loginWithEmail(email, password);
      } else {
        result = await authService.registerWithEmail(email, password);
      }

      if (result.success) {
        console.log('Auth success:', result.user);
        if (enableFaceId) {
            console.log('Face ID enabled for future logins');
        }
        alert(step === 'login_password' ? 'Welcome back!' : 'Account created!');
      } else {
        alert(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Views ---

  // 1. Landing View (The original splash screen)
  const renderLanding = () => (
    <div className="flex-1 w-full max-w-md px-6 flex flex-col justify-end pb-10 z-10">
      <div className="flex-1 flex flex-col items-center justify-center animate-[fadeIn_0.8s_ease-out]">
         <div className="mb-8 relative">
            <div className="w-24 h-24 bg-teal-600 rounded-full shadow-xl flex items-center justify-center">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                 <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
               </svg>
            </div>
            <div className="absolute inset-0 bg-teal-400 blur-2xl opacity-20 -z-10 rounded-full"></div>
         </div>
         <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Scriba</h1>
         <p className="mt-2 text-slate-500 text-sm font-medium">AI Clinical Reports</p>
      </div>

      <div className="space-y-3 w-full animate-[slideUp_0.6s_ease-out_forwards] translate-y-10 opacity-0" style={{ animationDelay: '0.2s' }}>
        <SocialButton variant="black" icon={<AppleIcon />} label="Continue with Apple" onClick={() => handleSocialLogin('apple', authService.loginWithApple)} />
        <SocialButton variant="outline" icon={<GoogleIcon />} label="Continue with Google" onClick={() => handleSocialLogin('google', authService.loginWithGoogle)} />
        <SocialButton variant="blue" icon={<FacebookIcon className="w-5 h-5" />} label="Continue with Facebook" onClick={() => handleSocialLogin('facebook', authService.loginWithFacebook)} />
        
        <div className="pt-2 flex flex-col gap-3">
           <SocialButton variant="teal" label="Sign up" onClick={() => setStep('email_entry')} />
           <SocialButton variant="tealSoft" label="Log in" onClick={() => setStep('email_entry')} />
        </div>
      </div>
    </div>
  );

  // 2. Email Entry View (ChatGPT style)
  const renderEmailEntry = () => (
    <div className="flex-1 w-full max-w-md px-6 flex flex-col z-10 pt-12 animate-[fadeIn_0.3s_ease-out]">
      <button onClick={() => setStep('landing')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
        <ArrowLeft className="w-6 h-6 text-slate-600" />
      </button>

      <div className="flex flex-col items-center mb-10 mt-8">
        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-teal-600/20">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Log in or sign up</h2>
        <p className="text-center text-slate-500 text-[15px] leading-relaxed max-w-xs">
          Generate professional clinical reports efficiently and securely.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
           <Input 
             type="email" 
             placeholder="Email address" 
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             autoFocus
           />
        </div>
        
        <SocialButton 
           variant="teal" 
           label={loading ? "Checking..." : "Continue"} 
           onClick={handleEmailContinue}
           className={loading ? "opacity-80" : ""}
        />

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 text-slate-400 font-medium">OR</span>
          </div>
        </div>

        <div className="space-y-3 pb-8">
          <SocialButton variant="outline" icon={<GoogleIcon />} label="Continue with Google" onClick={() => handleSocialLogin('google', authService.loginWithGoogle)} />
          <SocialButton variant="black" icon={<AppleIcon />} label="Continue with Apple" onClick={() => handleSocialLogin('apple', authService.loginWithApple)} />
          <SocialButton variant="blue" icon={<FacebookIcon className="w-5 h-5" />} label="Continue with Facebook" onClick={() => handleSocialLogin('facebook', authService.loginWithFacebook)} />
          <SocialButton variant="outline" icon={<ScanFace className="w-5 h-5 text-slate-900" />} label="Log in with Face ID" onClick={() => handleSocialLogin('face_id', authService.loginWithFaceId)} />
        </div>
      </div>
    </div>
  );

  // 3. Password / Final Auth View
  const renderPasswordAuth = (isSignup: boolean) => (
    <div className="flex-1 w-full max-w-md px-6 flex flex-col z-10 pt-12 animate-[slideUp_0.3s_ease-out]">
      <button onClick={() => setStep('email_entry')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
        <ArrowLeft className="w-6 h-6 text-slate-600" />
      </button>

      <div className="flex flex-col items-center mb-8 mt-8">
        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-teal-600/20">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-slate-500 text-sm">{email}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
           <Input 
             type="password" 
             placeholder={isSignup ? "Create a password" : "Enter your password"} 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             autoFocus
           />
           {isSignup && (
             <p className="text-xs text-slate-400 px-1">
               Password must be at least 8 characters long.
             </p>
           )}
        </div>
        
        {/* Face ID Toggle Option */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
           <div className="flex items-center space-x-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <ScanFace className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Enable Face ID</span>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" checked={enableFaceId} onChange={(e) => setEnableFaceId(e.target.checked)} className="sr-only peer" />
             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
           </label>
        </div>

        <SocialButton 
           variant="teal" 
           label={loading ? "Processing..." : (isSignup ? "Create account" : "Log in")} 
           onClick={handleFinalAuth}
           className={loading ? "opacity-80" : ""}
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50 to-transparent pointer-events-none" />
      
      {/* View Switcher */}
      {step === 'landing' && renderLanding()}
      {step === 'email_entry' && renderEmailEntry()}
      {step === 'login_password' && renderPasswordAuth(false)}
      {step === 'signup_password' && renderPasswordAuth(true)}

      {/* Global Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};