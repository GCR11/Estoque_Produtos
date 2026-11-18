import { z } from 'zod';

export const produtoSchema = z.object({
  nome_produto: z
    .string()
    .trim()
    .min(1, 'Informe o nome do produto.')
    .max(100, 'O nome do produto deve ter no máximo 100 caracteres.'),
  categoria_produto: z
    .string()
    .trim()
    .max(50, 'A categoria deve ter no máximo 50 caracteres.')
    .optional()
    .or(z.literal('')),
  quantidade_produto: z.coerce
    .number({
      required_error: 'Informe a quantidade.',
      invalid_type_error: 'Informe uma quantidade válida.',
    })
    .int('A quantidade deve ser um número inteiro.')
    .min(0, 'A quantidade não pode ser negativa.'),
  valor_produto: z.coerce
    .number({
      required_error: 'Informe o valor.',
      invalid_type_error: 'Informe um valor válido.',
    })
    .min(0, 'O valor não pode ser negativo.'),
  validade_produto: z.boolean().default(false),
});
