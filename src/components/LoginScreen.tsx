import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface User {
  nickname: string;
  password: string;
  avatar: string | null;
}

interface LoginScreenProps {
  registeredUser: User | null;
  onRegister: (user: User) => void;
  onLogin: (user: User) => void;
}

export default function LoginScreen({ registeredUser, onRegister, onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(!registeredUser);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>("https://user6496.cn.imgto.link/public/20260403/quality-restoration-20260404013737997.avif");
  const [showPassword, setShowPassword] = useState(false);
  const [addMoreInfo, setAddMoreInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (registeredUser) {
      setIsSignUp(false);
    }
  }, [registeredUser]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    if (!nickname.trim()) {
      setError('Nickname cannot be empty');
      return false;
    }
    if (nickname.length > 20) {
      setError('Nickname must be 1-20 characters');
      return false;
    }
    if (password.length < 6 || password.length > 20) {
      setError('Password must be 6-20 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isSignUp) {
      if (registeredUser && registeredUser.nickname === nickname) {
        setError('This nickname is already taken');
        return;
      }
      onRegister({ nickname, password, avatar });
    } else {
      if (registeredUser && registeredUser.nickname === nickname && registeredUser.password === password) {
        onLogin(registeredUser);
      } else {
        setError('Invalid ID or password');
      }
    }
  };

  const canSubmit = nickname.trim().length > 0 && password.length >= 6;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#F5F5F7] backdrop-blur-[10px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[90%] max-w-[350px] bg-white/92 backdrop-blur-md rounded-[24px] border border-[#E5E5E5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        {/* Header */}
        <div className="pt-6 px-6 pb-4 text-center">
          <h1 className="text-[20px] font-semibold text-black">
            {isSignUp ? 'Create an account' : 'Log In'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4 flex justify-center">
          <div className="flex w-[80%] bg-gray-50 rounded-[12px] p-1">
            <button 
              onClick={() => setIsSignUp(true)}
              className={cn(
                "flex-1 py-2 text-[14px] font-medium rounded-[10px] transition-all",
                isSignUp ? "bg-white text-black shadow-sm" : "text-[#666666]"
              )}
            >
              Sign Up
            </button>
            <button 
              onClick={() => {
                if (!registeredUser) {
                  alert('Please register an account first');
                  return;
                }
                setIsSignUp(false);
              }}
              className={cn(
                "flex-1 py-2 text-[14px] font-medium rounded-[10px] transition-all",
                !isSignUp ? "bg-white text-black shadow-sm" : "text-[#666666]"
              )}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center pb-5">
          <div 
            onClick={handleAvatarClick}
            className="w-[80px] h-[80px] rounded-full bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-center overflow-hidden cursor-pointer relative group"
          >
            {avatar || (registeredUser && !isSignUp && registeredUser.avatar) ? (
              <img 
                src={isSignUp ? (avatar || '') : (registeredUser?.avatar || '')} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-[#666666]" />
            )}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* Form */}
        <div className="px-6 space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <label className="text-[14px] text-[#666666] font-normal block ml-1">Your ID</label>
            <div className={cn(
              "w-full h-[48px] rounded-[12px] border bg-white flex items-center px-4 transition-colors",
              error && error.includes('ID') ? "border-red-400" : "border-[#E5E5E5]"
            )}>
              <input 
                type="text"
                placeholder="Enter your ID"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-transparent outline-none text-[16px] text-black placeholder:text-[#999999]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[14px] text-[#666666] font-normal block ml-1">Password</label>
            <div className={cn(
              "w-full h-[48px] rounded-[12px] border bg-white flex items-center px-4 transition-colors relative",
              error && error.includes('Password') ? "border-red-400" : "border-[#E5E5E5]"
            )}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="6-20 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full bg-transparent outline-none pr-10 placeholder:text-[#999999]",
                  !showPassword ? "text-[#999999] text-[10px]" : "text-[16px] text-black"
                )}
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 hover:bg-gray-50 rounded-full transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-[#666666]" /> : <Eye className="w-5 h-5 text-[#666666]" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-500 text-[12px] ml-1"
            >
              {error}
            </motion.p>
          )}

          {/* Additional Info Checkbox */}
          {isSignUp && (
            <div className="flex items-center gap-2 py-2">
              <button 
                onClick={() => setAddMoreInfo(!addMoreInfo)}
                className={cn(
                  "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors",
                  addMoreInfo ? "bg-[#FFB6C1] border-[#FFB6C1]" : "border-[#E5E5E5] bg-white"
                )}
              >
                {addMoreInfo && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-[14px] text-[#666666]">I agree to the User Agreement</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="p-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              "w-full h-[52px] rounded-[12px] text-[16px] font-medium transition-all",
              canSubmit 
                ? "bg-[#191919] text-white active:bg-[#333333]" 
                : "bg-[#CCCCCC] text-white cursor-not-allowed"
            )}
          >
            {isSignUp ? 'Create Account' : 'Log In'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
