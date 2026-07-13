import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, UserRound, X } from 'lucide-react';
import { MoexLogo } from '../components/MoexLogo';
import { authenticateUser } from '../data/authData';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

const roleMap: Record<'employee' | 'leader', UserRole> = {
  employee: 'manager',
  leader: 'block_head',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = useMemo(() => login.trim().length > 0 && password.trim().length > 0, [login, password]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    const auth = authenticateUser(login, password);
    if (!auth) {
      setError('Неверный логин или пароль');
      return;
    }

    setRole(roleMap[auth.access.role]);
    setError('');
    navigate('/manager');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f7fa 0%, #edf2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 24, boxShadow: '0 18px 60px rgba(31, 41, 55, 0.14)', border: '1px solid #E8EBF0', overflow: 'hidden' }}>
        <div style={{ padding: '28px 28px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <MoexLogo height={34} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1E2535' }}>Вход в aCRM</div>
            <div style={{ fontSize: 13, color: '#5A6478', marginTop: 6 }}>Введите данные сотрудника для доступа к рабочему пространству</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '8px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Логин</span>
            <div style={{ position: 'relative' }}>
              <UserRound size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AABB' }} />
              <input
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Введите логин"
                style={inputStyle}
              />
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Пароль</span>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AABB' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Введите пароль"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5A6478' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? <div style={{ color: '#E8001C', fontSize: 12, fontWeight: 600 }}>{error}</div> : null}

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', color: '#4A90D9', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Забыли пароль?
          </button>

          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              marginTop: 6,
              height: 46,
              borderRadius: 12,
              border: 'none',
              background: isFormValid ? '#E8001C' : '#C8D0DA',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'background 0.16s',
            }}
          >
            Войти
          </button>
        </form>
      </div>

      {showForgotPassword ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 60 }}>
          <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 18px 60px rgba(15, 23, 42, 0.24)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1E2535' }}>Техническая поддержка</div>
              <button type="button" onClick={() => setShowForgotPassword(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5A6478' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {`+7 (495) 411-83333, 5555, 5555@moex.com`}
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForgotPassword(false)} style={{ border: 'none', borderRadius: 10, background: '#E8001C', color: 'white', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 46,
  borderRadius: 12,
  border: '1px solid #D9E0E8',
  padding: '0 14px 0 42px',
  fontSize: 14,
  color: '#1E2535',
  outline: 'none',
  background: '#FCFDFF',
};
