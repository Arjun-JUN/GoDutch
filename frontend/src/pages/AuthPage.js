import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';
import { EnvelopeSimple, Lock, User } from '@/slate/icons';

function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : { email, password, name };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      onAuthSuccess();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF2' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-black mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              Split Bills,
              <br />
              <span style={{ color: '#0F0F0F', background: 'linear-gradient(135deg, #C4F1F9 0%, #BDE6A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Not Friendships
              </span>
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#4A4A4A', letterSpacing: '-0.01em', lineHeight: '1.6' }}>
              Scan receipts with AI, split expenses fairly, and settle up with friends. The modern way to manage group expenses.
            </p>
            <div className="gradient-overlay">
              <img
                src="https://images.pexels.com/photos/3937468/pexels-photo-3937468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Friends enjoying meal"
                className="neo-card w-full"
              />
            </div>
          </div>

          <div className="neo-card p-8">
            <div className="flex gap-2 mb-8">
              <button
                data-testid="login-tab"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-6 font-bold text-sm uppercase tracking-wider border-2 border-[#0F0F0F] rounded-full transition-all ${
                  isLogin ? 'bg-[#C4F1F9] shadow-[2px_2px_0px_0px_rgba(15,15,15,0.8)]' : 'bg-white hover:bg-gray-50'
                }`}
              >
                Login
              </button>
              <button
                data-testid="signup-tab"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-6 font-bold text-sm uppercase tracking-wider border-2 border-[#0F0F0F] rounded-full transition-all ${
                  !isLogin ? 'bg-[#C4F1F9] shadow-[2px_2px_0px_0px_rgba(15,15,15,0.8)]' : 'bg-white hover:bg-gray-50'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} weight="bold" />
                    <input
                      data-testid="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="neo-input w-full pl-12"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} weight="bold" />
                  <input
                    data-testid="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neo-input w-full pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} weight="bold" />
                  <input
                    data-testid="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="neo-input w-full pl-12"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                data-testid="submit-button"
                type="submit"
                disabled={loading}
                className="neo-btn-primary w-full text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;