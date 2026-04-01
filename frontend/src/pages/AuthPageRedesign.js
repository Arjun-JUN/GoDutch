import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { ArrowLeft, Fingerprint, Lock, User } from '@/slate/icons';

function AuthPageRedesign() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen overflow-hidden">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between bg-[rgba(249,249,248,0.92)] px-6 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#4f645b] transition-colors hover:bg-[#f2f4f3] active:scale-95"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
          <span className="text-lg font-bold tracking-[-0.04em] text-[#4f645b]">GoDutch</span>
        </div>
        <div />
      </header>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-12 pt-24">
        <div className="w-full max-w-[480px]">
          <div className="mb-12 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#4f645b]/60">
              {isLogin ? 'Welcome Back' : 'Join the Collective'}
            </span>
            <h1 className="text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#2e3433]">
              Split Bills,
              <br />
              <span className="text-[#43574f]">Not Friendships</span>
            </h1>
            <p className="max-w-[320px] text-lg font-medium leading-relaxed text-[#5a6060]">
              {isLogin
                ? 'Welcome back to the seamless way of sharing experiences.'
                : 'Sophisticated expense sharing for modern circles.'}
            </p>
          </div>

          <div className="rounded-xl bg-[#ffffff] p-10 shadow-[0_20px_40px_-10px_rgba(46,52,51,0.06)]">
            <div className="mb-8 flex gap-2 rounded-full bg-[#f2f4f3] p-1">
              <button
                data-testid="login-tab"
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all ${
                  isLogin ? 'bg-white text-[#2e3433] shadow-sm' : 'text-[#5a6060]'
                }`}
              >
                Login
              </button>
              <button
                data-testid="signup-tab"
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all ${
                  !isLogin ? 'bg-white text-[#2e3433] shadow-sm' : 'text-[#5a6060]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block px-1 text-sm font-bold tracking-tight text-[#5a6060]" htmlFor="full_name">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5a6060]" size={18} weight="bold" />
                    <input
                      id="full_name"
                      data-testid="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-0 border-b-2 border-transparent bg-[#f2f4f3] py-4 pl-12 pr-4 font-medium text-[#2e3433] transition-all duration-300 placeholder:text-[#adb3b2] focus:border-[#4f645b]/40 focus:bg-white focus:ring-0"
                      placeholder="Elias Thorne"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block px-1 text-sm font-bold tracking-tight text-[#5a6060]" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-lg border-0 border-b-2 border-transparent bg-[#f2f4f3] px-4 font-medium text-[#2e3433] transition-all duration-300 placeholder:text-[#adb3b2] focus:border-[#4f645b]/40 focus:bg-white focus:ring-0"
                  placeholder={isLogin ? 'name@example.com' : 'elias@studio.com'}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-sm font-bold tracking-tight text-[#5a6060]" htmlFor="password">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="text-xs font-bold text-[#4f645b] hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5a6060]" size={18} weight="bold" />
                  <input
                    id="password"
                    data-testid="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-lg border-0 border-b-2 border-transparent bg-[#f2f4f3] py-4 pl-12 pr-4 font-medium text-[#2e3433] transition-all duration-300 placeholder:text-[#adb3b2] focus:border-[#4f645b]/40 focus:bg-white focus:ring-0"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEmail('arjun@example.com'); setPassword('password123'); }}
                    className="rounded-full bg-[#4f645b]/10 px-3 py-1 text-[10px] font-bold text-[#4f645b] transition-colors hover:bg-[#4f645b]/20"
                  >
                    Dev: Arjun
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('sarah@example.com'); setPassword('password123'); }}
                    className="rounded-full bg-[#4f645b]/10 px-3 py-1 text-[10px] font-bold text-[#4f645b] transition-colors hover:bg-[#4f645b]/20"
                  >
                    Dev: Sarah
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.post('/dev/reset');
                        toast.success('Database reset and re-seeded!');
                      } catch (e) {
                        toast.error('Reset failed');
                      }
                    }}
                    className="ml-auto rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    Reset DB
                  </button>
                </div>
              )}

              <div className="pt-4">

                <button
                  data-testid="submit-button"
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f645b] to-[#43574f] text-lg font-bold text-[#e7fef3] shadow-lg shadow-[#4f645b]/10 transition-all duration-200 hover:brightness-105 hover:shadow-[#4f645b]/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                      <span className="text-xl">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-[#adb3b2]/20"></div>
              <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-[0.2em] text-[#adb3b2]">
                {isLogin ? 'Secure Access' : 'Secure Enrollment'}
              </span>
              <div className="flex-grow border-t border-[#adb3b2]/20"></div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button type="button" className="rounded-full bg-[#ebefed] p-3 transition-colors hover:bg-[#e5e9e8] active:scale-95">
                <Fingerprint className="text-[#5a6060]" size={20} weight="regular" />
              </button>
              <p className="text-sm leading-tight text-[#5a6060]">
                {isLogin ? (
                  <>
                    Login with Biometrics or SSO for a{' '}
                    <a className="font-bold text-[#4f645b] underline decoration-[#4f645b]/30 underline-offset-4 hover:decoration-[#4f645b]" href="#!">
                      faster experience
                    </a>
                    .
                  </>
                ) : (
                  <>
                    By joining, you agree to our{' '}
                    <a className="font-bold text-[#4f645b] underline decoration-[#4f645b]/30 underline-offset-4 hover:decoration-[#4f645b]" href="#!">
                      Terms of Service
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="font-medium text-[#5a6060]">
              {isLogin ? 'New here?' : 'Already part of the collective?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-[#4f645b] transition-colors hover:text-[#43574f]"
              >
                {isLogin ? 'Create Account →' : 'Log In →'}
              </button>
            </p>
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed -bottom-24 -left-24 -z-10 h-96 w-96 rounded-full bg-[#4f645b]/5 blur-[100px]"></div>
      <div className="pointer-events-none fixed -right-24 -top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[#485ba3]/5 blur-[120px]"></div>
    </div>
  );
}

export default AuthPageRedesign;
