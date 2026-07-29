import React, { useState } from 'react';

// Mock database of users with pre-assigned roles
const MOCK_USERS_DB = [
  {
    email: 'doctor@careconnect.com',
    password: 'password123',
    name: 'Dr. Sarah Jenkins',
    role: 'doctor',
  },
  {
    email: 'reception@careconnect.com',
    password: 'password123',
    name: 'Alex Rivera',
    role: 'receptionist',
  },
  {
    email: 'manager@careconnect.com',
    password: 'password123',
    name: 'Eleanor Vance',
    role: 'manager',
  },
];

export default function Authentication({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // Sign In state (Only email & password required)
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Sign Up state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check mock database for matching email and password
    const foundUser = MOCK_USERS_DB.find(
      (u) =>
        u.email.toLowerCase() === loginData.email.toLowerCase() &&
        u.password === loginData.password
    );

    if (foundUser) {
      setSuccessMsg(`Authenticated successfully. Redirecting as ${foundUser.role}...`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(foundUser);
      }, 500);
    } else {
      setError('Invalid email or password. Use one of the mock credentials below.');
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const newUser = {
      email: signupData.email,
      password: signupData.password,
      name: signupData.fullName,
      role: signupData.role,
    };

    // Add to mock DB in memory
    MOCK_USERS_DB.push(newUser);

    setSuccessMsg('Account created successfully! Switching to sign in...');
    setTimeout(() => {
      setIsLogin(true);
      setLoginData({ email: signupData.email, password: signupData.password });
      setSuccessMsg('Account created. Click Sign In to proceed.');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-2xl mb-3">
            ┼
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CareConnect</h1>
          <p className="text-xs text-slate-400 mt-1">Clinical Workspace Portal</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-800/60 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="doctor@careconnect.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-teal-500/10"
            >
              Sign In
            </button>

            {/* Helper box listing test accounts */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Available Demo Credentials:</p>
              <div className="space-y-1.5">
                {MOCK_USERS_DB.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => setLoginData({ email: u.email, password: u.password })}
                    className="w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-[11px] transition-colors border border-slate-800"
                  >
                    <span className="text-slate-300 truncate">{u.email}</span>
                    <span className="text-teal-400 capitalize font-mono text-[10px] ml-2 shrink-0">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Sarah Jenkins"
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@careconnect.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Role / Account Type</label>
              <select
                value={signupData.role}
                onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-teal-500/10"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
