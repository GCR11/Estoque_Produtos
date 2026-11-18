import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../services/supabase.js';
import { registroSchema } from '../schemas/authSchemas.js';
import { mapAuthError } from '../utils/authErrors.js';

export default function Registro() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registroSchema),
    mode: 'onBlur',
  });

  async function cadastrar(dados) {
    setErro('');
    setMensagem('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: { data: { full_name: dados.nome } },
      });

      if (error) {
        const mensagemErro = mapAuthError(error);
        setErro(mensagemErro);
        setError(['user_already_exists', 'email_exists'].includes(error.code) ? 'email' : 'root.server', {
          message: mensagemErro,
        });
        return;
      }

      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setMensagem('Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.');
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível realizar o cadastro.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="registro-titulo">
        <span className="auth-eyebrow">CONTROLE DE ESTOQUE</span>
        <h1 id="registro-titulo">Crie sua conta</h1>
        <p className="auth-description">Cadastre-se para acessar seus produtos.</p>

        {erro && <p className="auth-message auth-message-error" role="alert">{erro}</p>}
        {mensagem && <p className="auth-message auth-message-success" role="status">{mensagem}</p>}

        <form className="auth-form" onSubmit={handleSubmit(cadastrar)} noValidate>
          <label htmlFor="registro-nome">Nome completo</label>
          <input id="registro-nome" type="text" autoComplete="name" aria-invalid={Boolean(errors.nome)} {...register('nome')} />
          {errors.nome && <span className="auth-field-error">{errors.nome.message}</span>}

          <label htmlFor="registro-email">E-mail</label>
          <input id="registro-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          {errors.email && <span className="auth-field-error">{errors.email.message}</span>}

          <label htmlFor="registro-senha">Senha</label>
          <input id="registro-senha" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.senha)} {...register('senha')} />
          {errors.senha && <span className="auth-field-error">{errors.senha.message}</span>}

          <label htmlFor="registro-confirmacao">Confirme a senha</label>
          <input id="registro-confirmacao" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmacao)} {...register('confirmacao')} />
          {errors.confirmacao && <span className="auth-field-error">{errors.confirmacao.message}</span>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
