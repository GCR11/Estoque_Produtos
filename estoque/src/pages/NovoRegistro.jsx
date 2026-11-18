 import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../services/supabase.js';
import { produtoSchema } from '../schemas/produtoSchema.js';

function mensagemErroCadastro(error) {
  if (error.code === '42501') {
    return 'O Supabase bloqueou o cadastro pelas regras de segurança. Confira as políticas RLS e a coluna user_id no banco.';
  }

  if (error.code === 'PGRST204' || error.code === '42703') {
    const colunaAusente = error.message.match(/the ['"]([^'"]+)['"] column/i)
      || error.message.match(/column ['"]([^'"]+)['"]/i);

    if (colunaAusente) {
      return `A coluna "${colunaAusente[1]}" não foi encontrada no Supabase. Confira o esquema da tabela Estoque e aplique o arquivo supabase.sql.`;
    }

    return 'A tabela Estoque não tem uma das colunas esperadas. Confira os nomes das colunas e aplique o arquivo supabase.sql.';
  }

  if (error.code === '23514') {
    return 'O nome do produto não atende à regra de tamanho configurada no banco.';
  }

  if (error.code === '23502') {
    return 'O banco exige um campo que não foi enviado. Confira as colunas obrigatórias da tabela Estoque.';
  }

  return 'Não foi possível cadastrar o produto. Confira a configuração do banco e tente novamente.';
}

export default function NovoRegistro() {
  const { user } = useAuth();
  const [erroServidor, setErroServidor] = useState('');
  const [sucesso, setSucesso] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(produtoSchema),
    mode: 'onBlur',
    defaultValues: { validade_produto: false },
  });

  async function cadastrar(dados) {
    setErroServidor('');
    setSucesso('');
    const nomeCriador = user.user_metadata?.full_name?.trim()
      || user.user_metadata?.name?.trim()
      || 'Não informado';

    try {
      const { error } = await supabase.from('Estoque').insert({
        nome_produto: dados.nome_produto,
        categoria_produto: dados.categoria_produto || null,
        quantidade_produto: dados.quantidade_produto,
        valor_produto: dados.valor_produto,
        validade_produto: dados.validade_produto,
        nome_criador: nomeCriador,
        user_id: user.id,
      });

      if (error) {
        setErroServidor(mensagemErroCadastro(error));

        if (error.code === '23514') {
          setError('nome_produto', { message: 'O nome do produto não atende à regra de tamanho.' });
        }
        return;
      }

      reset();
      setSucesso('Produto cadastrado com sucesso.');
    } catch {
      setErroServidor('Não foi possível conectar ao Supabase. Verifique sua conexão e tente novamente.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card registro-produto-card" aria-labelledby="novo-registro-titulo">
        <span className="auth-eyebrow">NOVO PRODUTO</span>
        <h1 id="novo-registro-titulo">Cadastrar registro</h1>
        <p className="auth-description">Informe os dados do produto que entrará no estoque.</p>

        {erroServidor && <p className="auth-message auth-message-error" role="alert">{erroServidor}</p>}
        {sucesso && <p className="auth-message auth-message-success" role="status">{sucesso}</p>}

        <form className="auth-form" onSubmit={handleSubmit(cadastrar)} noValidate>
          <label htmlFor="nome-produto">Nome do produto</label>
          <input id="nome-produto" type="text" aria-invalid={Boolean(errors.nome_produto)} {...register('nome_produto')} />
          {errors.nome_produto && <span className="auth-field-error">{errors.nome_produto.message}</span>}

          <label htmlFor="categoria-produto">Categoria</label>
          <input id="categoria-produto" type="text" aria-invalid={Boolean(errors.categoria_produto)} {...register('categoria_produto')} />
          {errors.categoria_produto && <span className="auth-field-error">{errors.categoria_produto.message}</span>}

          <label htmlFor="quantidade-produto">Quantidade</label>
          <input id="quantidade-produto" type="number" min="0" step="1" aria-invalid={Boolean(errors.quantidade_produto)} {...register('quantidade_produto')} />
          {errors.quantidade_produto && <span className="auth-field-error">{errors.quantidade_produto.message}</span>}

          <label htmlFor="valor-produto">Valor</label>
          <input id="valor-produto" type="number" min="0" step="0.01" aria-invalid={Boolean(errors.valor_produto)} {...register('valor_produto')} />
          {errors.valor_produto && <span className="auth-field-error">{errors.valor_produto.message}</span>}

          <label className="auth-checkbox-label" htmlFor="validade-produto">
            <input id="validade-produto" type="checkbox" {...register('validade_produto')} />
            Produto dentro da validade
          </label>

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar produto'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/registros">Voltar para produtos</Link>
        </p>
      </section>
    </main>
  );
}
