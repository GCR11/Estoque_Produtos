export function mapAuthError(error) {
  const code = error?.code;

  if (code === 'invalid_credentials') {
    return 'E-mail ou senha inválidos.';
  }

  if (
    code === 'email_address_not_authorized'
    || code === 'user_already_exists'
    || code === 'email_exists'
  ) {
    return 'Este e-mail já está cadastrado.';
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
