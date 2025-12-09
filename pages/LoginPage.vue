<script setup lang="ts">
import { ref, computed } from 'vue';
import { AppleIcon, FacebookIcon } from '../components/icons';
import { authService } from '../services/authService';
import { ArrowLeft, ScanFace } from 'lucide-vue-next';
import GoogleLoginButton from '../components/GoogleLoginButton.vue';

import { facebookAuth } from '../services/social/facebookAuth';
import { appleAuth } from '../services/social/appleAuth';
import { useAppleLogin } from '../composables/useAppleLogin';

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

// --- Methods ---
const { signIn: signInWithApple } = useAppleLogin(appleClientId, appleRedirectUri);

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
    // Apple ID result structure: { success: true, data: { authorization: { id_token: '...' } } }
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

const handleGoogleSuccess = (token: string) => handleSocialSuccess('google', token);

const handleGoogleError = (msg: string) => {
  console.error('Google Login Error:', msg);
  alert('Google Login Failed');
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
      console.log('Auth success:', result.user);
      if (enableFaceId.value) {
        console.log('Face ID enabled for future logins');
      }
      alert(step.value === 'login_password' ? 'Welcome back!' : 'Account created!');
    } else {
      alert(result.error || 'Authentication failed');
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// --- Styles Helper ---
const getButtonClass = (variant: ButtonVariant) => {
  const base = "w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-full font-semibold text-[15px] transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
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
          <div class="mb-8 relative">
            <div class="w-24 h-24 bg-teal-600 rounded-full shadow-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-12 h-12 text-white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div class="absolute inset-0 bg-teal-400 blur-2xl opacity-20 -z-10 rounded-full"></div>
          </div>
          <h1 class="text-4xl font-bold text-slate-900 tracking-tight">Scriba</h1>
          <p class="mt-2 text-slate-500 text-sm font-medium">AI Clinical Reports</p>
        </div>

        <div class="space-y-3 w-full animate-[slideUp_0.6s_ease-out_forwards] translate-y-10 opacity-0" style="animation-delay: 0.2s">
          <button :class="getButtonClass('black')" @click="handleAppleLogin">
            <div class="w-5 h-5 flex items-center justify-center"><AppleIcon /></div>
            <span>Continue with Apple</span>
          </button>
          
          <GoogleLoginButton 
            :client-id="googleClientId" 
            container-id="google-btn-landing"
            width="400"
            @success="handleGoogleSuccess" 
            @error="handleGoogleError"
            class="w-full flex justify-center"
          />
          
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
          <div class="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-teal-600/20">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-6 h-6 text-white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
             </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Log in or sign up</h2>
          <p class="text-center text-slate-500 text-[15px] leading-relaxed max-w-xs">
            Generate professional clinical reports efficiently and securely.
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
             <input 
               type="email" 
               placeholder="Email address" 
               v-model="email"
               class="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
               autofocus
             />
          </div>
          
          <button 
             :class="[getButtonClass('teal'), loading ? 'opacity-80' : '']" 
             @click="handleEmailContinue"
          >
             {{ loading ? "Checking..." : "Continue" }}
          </button>

          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-50 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          <div class="space-y-3 pb-8">
            <GoogleLoginButton 
              :client-id="googleClientId" 
              @success="handleGoogleSuccess" 
              @error="handleGoogleError"
              class="w-full flex justify-center"
            />
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
          <div class="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-teal-600/20">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-6 h-6 text-white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
             </svg>
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
  </div>
</template>