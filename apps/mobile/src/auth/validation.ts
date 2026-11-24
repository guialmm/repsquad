const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | null {
  if (!name.trim()) {
    return "Informe seu nome.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Informe seu e-mail.";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "E-mail inválido.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Informe sua senha.";
  }
  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return null;
}

export function translateAuthError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("401") || msg.includes("credenciais") || msg.includes("invalid")) {
      return "E-mail ou senha incorretos.";
    }
    if (msg.includes("409") || msg.includes("already") || msg.includes("já existe")) {
      return "Este e-mail já está cadastrado.";
    }
    if (msg.includes("422")) {
      return "Dados inválidos. Confira os campos e tente novamente.";
    }
    if (msg.includes("abort") || msg.includes("timeout") || msg.includes("network")) {
      return "Não foi possível conectar ao servidor. Tente novamente.";
    }
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}
