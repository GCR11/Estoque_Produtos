import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

export const registroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, 'Informe o nome completo.')
      .min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Informe o e-mail.')
      .email('Informe um e-mail válido.'),
    senha: z
      .string()
      .min(1, 'Informe a senha.')
      .min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmacao: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((dados) => dados.senha === dados.confirmacao, {
    message: 'A confirmação deve ser igual à senha.',
    path: ['confirmacao'],
  });
