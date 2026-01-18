import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';

export function AuthPage() {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) setError(error.message);
            } else {
                const { error } = await signUp(email, password, fullName);
                if (error) setError(error.message);
                else setError(t('auth.successSignup'));
            }
        } catch (err) {
            setError(t('auth.unexpectedError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        Gestio System
                    </div>
                    <h2>{isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}</h2>
                    <p className="stat-label">
                        {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>
                                <User size={18} /> {t('auth.fullName')}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder={t('auth.fullNamePlaceholder')}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            <Mail size={18} /> {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('auth.emailPlaceholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Lock size={18} /> {t('auth.password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className={`auth-message ${error.includes('creada') ? 'success' : 'error'}`}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (
                            t('auth.processing')
                        ) : isLogin ? (
                            <>
                                <LogIn size={18} /> {t('auth.loginTitle')}
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} /> {t('auth.signupTitle')}
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
                        {isLogin ? t('auth.signupHere') : t('auth.loginHere')}
                    </button>
                </div>
            </div>
        </div>
    );
}
