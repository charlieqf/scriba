<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AppleIcon, FacebookIcon, GoogleIcon } from '../components/icons';
import { authService } from '../services/authService';
import logoImg from '../assets/logo.png';
import logoIcon from '../assets/logo_icon.png';
import { ArrowLeft, ScanFace, X } from 'lucide-vue-next';

import { facebookAuth } from '../services/social/facebookAuth';
import { appleAuth } from '../services/social/appleAuth';
import { useAppleLogin } from '../composables/useAppleLogin';
import { useGoogleLogin } from '../composables/useGoogleLogin';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER';
const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || '';
const appleRedirectUri = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;

// --- Types ---
type AuthStep = 'landing' | 'email_entry' | 'login_password' | 'signup_password';
type ButtonVariant = 'outline' | 'black' | 'blue' | 'teal' | 'ghost' | 'tealSoft';

// --- State ---
const step = ref<AuthStep>('landing');
const loading = ref(false);
const email = ref('');
const password = ref('');
const enableFaceId = ref(false);
const emailError = ref('');
const verificationPending = ref(false);
const verificationMessage = ref('');

const validateEmail = () => {
  if (!email.value) {
    emailError.value = '';
    return;
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.value)) {
    emailError.value = 'Invalid email format';
  } else {
    emailError.value = '';
  }
};

const clearEmail = () => {
  email.value = '';
  emailError.value = '';
};

// --- Methods ---
const { signIn: signInWithApple } = useAppleLogin(appleClientId, appleRedirectUri);

const handleSocialSuccess = async (provider: 'google' | 'apple' | 'facebook', token: string) => {
  loading.value = true;
  try {
    const result = await authService.socialLogin(provider, token);
    if (result.success) {
      console.log('Logged in user:', result.user);
      alert(`Successfully logged in with ${provider === 'apple' ? 'Apple' : (provider === 'google' ? 'Google' : 'Facebook')}`);
    } else {
      alert(result.error);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleGoogleSuccess = (token: string) => handleSocialSuccess('google', token);

const { login: googleLogin } = useGoogleLogin(googleClientId, (response) => {
    if (response.credential) {
         handleGoogleSuccess(response.credential);
    } else {
         console.error("Google login failed", response);
         alert('Google Login Failed');
    }
});

const handleSocialLogin = async (provider: string, loginFn: () => Promise<any>) => {
  loading.value = true;
  try {
    const result = await loginFn();
    if (result.success) {
      console.log('Logged in user:', result.user);
      alert(`Successfully logged in with ${provider === 'face_id' ? 'Face ID' : provider}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleFacebookLogin = async () => {
    loading.value = true;
    try {
        const result = await facebookAuth.login();
        if (result && result.token) {
            await handleSocialSuccess('facebook', result.token);
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const handleAppleLogin = async () => {
  loading.value = true;
  try {
    const result = await signInWithApple();
    if (result.success && result.data?.authorization?.id_token) {
        await handleSocialSuccess('apple', result.data.authorization.id_token);
    } else {
        console.error('Apple login failed', result);
        if (result.error) alert('Apple Login Failed: ' + JSON.stringify(result.error));
    }
  } catch (err) {
    console.error(err);
    alert('Apple Login Error');
  } finally {
    loading.value = false;
  }
};

const handleEmailContinue = async () => {
  if (!email.value) return;
  loading.value = true;
  try {
    const exists = await authService.checkEmail(email.value);
    if (exists) {
      step.value = 'login_password';
    } else {
      step.value = 'signup_password';
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleFinalAuth = async () => {
  if (!password.value) return;
  loading.value = true;
  try {
    let result;
    if (step.value === 'login_password') {
      result = await authService.loginWithEmail(email.value, password.value);
    } else {
      result = await authService.registerWithEmail(email.value, password.value);
    }

    if (result.success) {
      if (step.value === 'signup_password' && result.message) {
          // Registration success, verify email
          verificationPending.value = true;
          verificationMessage.value = result.message;
      } else {
          // Login success
          console.log('Auth success:', result.user);
          if (enableFaceId.value) {
            console.log('Face ID enabled for future logins');
          }
          alert('Welcome back!');
      }
    } else {
      alert(result.error || 'Authentication failed');
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        loading.value = true;
        try {
            const result = await authService.verifyEmail(token);
            if (result.success) {
                alert('Email verified successfully! You are now logged in.');
                // Clear URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                alert('Verification failed: ' + result.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            loading.value = false;
        }
    }
});

// --- Styles Helper ---
const getButtonClass = (variant: ButtonVariant) => {
  const base = "w-full flex items-center justify-center space-x-3 py-4 px-4 rounded-full font-semibold text-[15px] transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
  const variants = {
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    black: "bg-slate-900 text-white hover:bg-slate-800 border border-transparent",
    blue: "bg-[#1877F2] text-white hover:bg-[#166fe5] border border-transparent",
    teal: "bg-teal-600 text-white hover:bg-teal-700 border border-transparent shadow-lg shadow-teal-600/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
    tealSoft: "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100",
  };
  return `${base} ${variants[variant]}`;
};
</script>

<template>
  <div class="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
    
    <!-- Decorative Background -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50 to-transparent pointer-events-none"></div>

    <!-- 1. Landing View -->
    <Transition name="fade">
      <div v-if="step === 'landing'" class="flex-1 w-full max-w-md px-6 flex flex-col justify-end pb-10 z-10 absolute inset-0 m-auto h-full">
        <div class="flex-1 flex flex-col items-center justify-center animate-[fadeIn_0.8s_ease-out]">
          <div class="mb-10 relative">
            <img :src="logoImg" alt="Scriba" class="w-48 h-auto object-contain" />
          </div>
          <p class="mt-2 text-slate-500 text-sm font-medium">AI Clinical Badge</p>
        </div>

        <div class="space-y-3 w-full animate-[slideUp_0.6s_ease-out_forwards] translate-y-10 opacity-0" style="animation-delay: 0.2s">
          <button :class="getButtonClass('black')" @click="handleAppleLogin">
            <div class="w-5 h-5 flex items-center justify-center"><AppleIcon /></div>
            <span>Continue with Apple</span>
          </button>
          
          <button :class="getButtonClass('outline')" @click="googleLogin">
             <div class="w-5 h-5 flex items-center justify-center"><GoogleIcon class="w-5 h-5" /></div>
             <span>Continue with Google</span>
          </button>
          
          <button :class="getButtonClass('blue')" @click="handleFacebookLogin">
             <div class="w-5 h-5 flex items-center justify-center"><FacebookIcon class="w-5 h-5" /></div>
             <span>Continue with Facebook</span>
          </button>
          
          <div class="pt-2 flex flex-col gap-3">
             <button :class="getButtonClass('teal')" @click="step = 'email_entry'">Sign up</button>
             <button :class="getButtonClass('tealSoft')" @click="step = 'email_entry'">Log in</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. Email Entry View -->
    <Transition name="slide-up">
      <div v-if="step === 'email_entry'" class="flex-1 w-full max-w-md px-6 flex flex-col z-10 pt-12 absolute inset-0 m-auto h-full bg-slate-50">
        <button @click="step = 'landing'" class="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft class="w-6 h-6 text-slate-600" />
        </button>

        <div class="flex flex-col items-center mb-10 mt-8">
          <div class="mb-6">
             <img :src="logoImg" alt="Scriba" class="w-48 h-auto object-contain" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-6">Log in or Sign up</h2>
        </div>

        <div class="space-y-4">
          <div class="relative mb-2">
            <div class="relative">
              <input 
                type="email" 
                id="email"
                v-model="email"
                @blur="validateEmail"
                @input="emailError = ''"
                class="peer w-full px-4 pt-6 pb-2 rounded-xl border bg-white text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 transition-all text-base"
                :class="emailError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'"
                placeholder="Email address"
                autofocus
              />
              <label 
                for="email"
                class="absolute left-4 top-4 text-slate-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 select-none pointer-events-none"
                :class="emailError ? 'peer-focus:text-red-500 text-red-500' : ''"
              >
                Email address
              </label>
              
              <button 
                v-if="email" 
                @click="clearEmail"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <p v-if="emailError" class="text-red-500 text-xs mt-1 ml-1">{{ emailError }}</p>
          </div>
          
          <button 
             :class="[getButtonClass('teal'), (loading || emailError) ? 'opacity-80 cursor-not-allowed' : '']" 
             @click="!emailError && handleEmailContinue()"
             :disabled="!!emailError"
          >
             {{ loading ? "Checking..." : "Continue" }}
          </button>
          
          <p class="text-center text-xs text-slate-400 mt-4 px-4 leading-relaxed">
            By continuing, you agree to our <a href="#" class="underline hover:text-slate-500">Terms of Service</a> and <a href="#" class="underline hover:text-slate-500">Privacy Policy</a>.
          </p>

          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-50 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          <div class="space-y-3 pb-8">
            <button :class="getButtonClass('outline')" @click="googleLogin">
               <div class="w-5 h-5 flex items-center justify-center"><GoogleIcon class="w-5 h-5" /></div>
               <span>Continue with Google</span>
            </button>
            <button :class="getButtonClass('black')" @click="handleAppleLogin">
              <div class="w-5 h-5 flex items-center justify-center"><AppleIcon /></div>
              <span>Continue with Apple</span>
            </button>
            <button :class="getButtonClass('blue')" @click="handleFacebookLogin">
               <div class="w-5 h-5 flex items-center justify-center"><FacebookIcon class="w-5 h-5" /></div>
               <span>Continue with Facebook</span>
            </button>
            <button :class="getButtonClass('outline')" @click="handleSocialLogin('face_id', authService.loginWithFaceId)">
               <div class="w-5 h-5 flex items-center justify-center"><ScanFace class="w-5 h-5 text-slate-900" /></div>
               <span>Log in with Face ID</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 3. Password / Final Auth View -->
    <Transition name="slide-up">
      <div v-if="step === 'login_password' || step === 'signup_password'" class="flex-1 w-full max-w-md px-6 flex flex-col z-10 pt-12 absolute inset-0 m-auto h-full bg-slate-50">
        <button @click="step = 'email_entry'" class="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft class="w-6 h-6 text-slate-600" />
        </button>

        <div class="flex flex-col items-center mb-8 mt-8">
          <div class="mb-4">
             <img :src="logoImg" alt="Logo" class="w-48 h-auto object-contain" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-1">
            {{ step === 'signup_password' ? "Create your account" : "Welcome back" }}
          </h2>
          <p class="text-slate-500 text-sm">{{ email }}</p>
        </div>

        <div class="space-y-6">
          <div class="space-y-4">
             <input 
               type="password" 
               :placeholder="step === 'signup_password' ? 'Create a password' : 'Enter your password'" 
               v-model="password"
               class="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
               autofocus
             />
             <p v-if="step === 'signup_password'" class="text-xs text-slate-400 px-1">
               Password must be at least 8 characters long.
             </p>
          </div>
          
          <!-- Face ID Toggle Option -->
          <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
             <div class="flex items-center space-x-3">
                <div class="bg-slate-100 p-2 rounded-lg">
                  <ScanFace class="w-5 h-5 text-slate-600" />
                </div>
                <span class="text-sm font-medium text-slate-700">Enable Face ID</span>
             </div>
             <label class="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" v-model="enableFaceId" class="sr-only peer" />
               <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
             </label>
          </div>

          <button 
             :class="[getButtonClass('teal'), loading ? 'opacity-80' : '']" 
             @click="handleFinalAuth"
          >
             {{ loading ? "Processing..." : (step === 'signup_password' ? "Create account" : "Log in") }}
          </button>
        </div>
      </div>
    </Transition>
    <!-- 4. Verification Sent View -->
    <Transition name="slide-up">
      <div v-if="verificationPending" class="flex-1 w-full max-w-md px-6 flex flex-col z-20 pt-12 absolute inset-0 m-auto h-full bg-slate-50 items-center justify-center">
        <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 text-teal-600">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-8 h-8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
             <polyline points="22,6 12,13 2,6"></polyline>
           </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p class="text-center text-slate-500 text-[15px] leading-relaxed max-w-xs mb-8">
           {{ verificationMessage || "We've sent a verification link to your email." }}
        </p>
        
        <button 
           :class="getButtonClass('outline')" 
           @click="verificationPending = false; step = 'login_password'"
        >
           Back to Login
        </button>
      </div>
    </Transition>
  </div>
</template>