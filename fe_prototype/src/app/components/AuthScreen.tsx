import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { toast } from 'sonner';

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthScreenProps {
  onAuth: (user: AuthUser) => void;
}

const STORAGE_KEY = 'topcv_demo_accounts';

interface StoredAccount {
  name: string;
  email: string;
  password: string;
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const accounts = loadAccounts();
    const match = accounts.find(
      (a) => a.email.toLowerCase() === loginEmail.trim().toLowerCase() && a.password === loginPassword
    );
    if (!match) {
      toast.error('Email hoặc mật khẩu không đúng');
      return;
    }
    toast.success(`Chào mừng trở lại, ${match.name}!`);
    onAuth({ name: match.name, email: match.email });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    const accounts = loadAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      toast.error('Email này đã được đăng ký');
      return;
    }
    const newAccount: StoredAccount = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
    };
    saveAccounts([...accounts, newAccount]);
    toast.success(`Tạo tài khoản thành công! Xin chào ${newAccount.name}`);
    onAuth({ name: newAccount.name, email: newAccount.email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-violet-50 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <span className="text-xl font-black text-white">T</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">TopCV</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded text-[11px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Smart Job Search</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
            <TabsList className="grid grid-cols-2 w-full mb-5">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="ban@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Hiện/ẩn mật khẩu"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                  Đăng nhập
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-name"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="ban@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Tối thiểu 6 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Hiện/ẩn mật khẩu"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Nhập lại mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                  Tạo tài khoản
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-violet-600 font-semibold hover:underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Bản prototype • Dữ liệu lưu cục bộ trên trình duyệt
        </p>
      </motion.div>
    </div>
  );
}
