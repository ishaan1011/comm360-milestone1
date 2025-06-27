// webrtc-client/src/pages/RegisterPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const { register, user }      = useContext(AuthContext);
  const navigate                = useNavigate();

  // if already logged in, go home
  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) {
      return alert("Passwords don't match");
    }
    try {
      await register({ fullName, username, email, password });
      navigate('/');              // or '/dashboard'
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen">
      {/* you can copy over your LoginPage’s left panel / background here */}
      <div className="m-auto w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="pl-10 w-full border p-2 rounded"
                placeholder="Jane Doe"
              />
            </div>
          </div>
          <div>
            <label className="block">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="pl-10 w-full border p-2 rounded"
                placeholder="janedoe123"
              />
            </div>
          </div>
          <div>
            <label className="block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10 w-full border p-2 rounded"
                placeholder="jane@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-10 w-full border p-2 rounded"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPw ? <EyeOff/> : <Eye/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full border p-2 rounded"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded font-semibold flex justify-center"
          >
            {false ? <Loader className="animate-spin"/> : 'Sign up'}
          </button>
        </form>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}