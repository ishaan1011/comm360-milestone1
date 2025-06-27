import React, { useState, useContext, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader, 
  User,
  Smartphone,
  Shield,
  Video,
  MessageCircle,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const { login, googleLogin, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animate features on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleFieldFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleFieldBlur = () => {
    setActiveField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal clear video conferencing with WebRTC technology"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Instant messaging during meetings"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption for your conversations"
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Smart AI features for enhanced productivity"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Features */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-60 h-60 bg-white/5 rounded-full"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 w-full">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold">360</span>
              </motion.div>
              <h1 className="text-3xl font-bold">Comm360</h1>
            </div>
            <p className="text-blue-100 text-lg">Professional video conferencing platform</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
                variants={featureVariants}
                initial="hidden"
                animate={showFeatures ? "visible" : "hidden"}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.15)"
                }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">Trusted by 10,000+ users</span>
            </div>
            <p className="text-blue-100 text-sm">
              Join thousands of professionals who trust Comm360 for their video conferencing needs.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-2xl font-bold">360</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    animate={{
                      scale: activeField === 'email' ? 1.1 : 1,
                      color: activeField === 'email' ? '#3B82F6' : '#9CA3AF'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="h-5 w-5" />
                  </motion.div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus('email')}
                    onBlur={handleFieldBlur}
                    required
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                    animate={{
                      borderColor: activeField === 'email' ? '#3B82F6' : 'transparent'
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    animate={{
                      scale: activeField === 'password' ? 1.1 : 1,
                      color: activeField === 'password' ? '#3B82F6' : '#9CA3AF'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Lock className="h-5 w-5" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus('password')}
                    onBlur={handleFieldBlur}
                    required
                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div
                          key="eye-off"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                    animate={{
                      borderColor: activeField === 'password' ? '#3B82F6' : 'transparent'
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div 
              className="my-6"
              variants={itemVariants}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 backdrop-blur-sm">Or continue with</span>
                </div>
              </div>
            </motion.div>

            {/* Google Sign In */}
            <GoogleLogin
              onSuccess={async ({ credential }) => {
                console.log('✅ got ID token:', credential);
                const result = await googleLogin(credential);
                if (result.success) {
                  navigate('/');
                } else {
                  alert(result.error);
                }
              }}
              onError={() => {
                console.error('❌ Google Login Failed');
                alert('Google Authentication Failed');
              }}
            />


            {/* Sign Up Link */}
            <motion.div 
              className="mt-6 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}