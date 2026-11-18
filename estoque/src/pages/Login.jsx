import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../services/supabase.js';
import { loginSchema } from '../schemas/authSchemas.js';
import { mapAuthError } from '../utils/authErrors.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authError } = useAuth();
  const [erro, setErro] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  async function entrar(dados) {
    setErro('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: dados.email,
        password: dados.senha,
      });

      if (error) {
        const mensagem = mapAuthError(error);
        setErro(mensagem);
        setError('root.server', { message: mensagem });
        return;
      }

      const destino = location.state?.from?.pathname || '/dashboard';
      navigate(destino, { replace: true });
    } catch (error) {
      setErro(error.message || 'Não foi possível realizar o login.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-titulo">
        <span className="auth-eyebrow">CONTROLE DE ESTOQUE</span>
        <h1 id="login-titulo">Acesse sua conta</h1>
        <p className="auth-description">Entre para consultar e gerenciar seus produtos.</p>

        {(erro || authError) && (
          <p className="auth-message auth-message-error" role="alert">{erro || authError}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit(entrar)} noValidate>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <span className="auth-field-error">{errors.email.message}</span>}

          <label htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.senha)}
            {...register('senha')}
          />
          {errors.senha && <span className="auth-field-error">{errors.senha.message}</span>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Ainda não tem conta? <Link to="/registro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
