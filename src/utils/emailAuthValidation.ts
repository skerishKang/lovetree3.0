export const EMAIL_AUTH_MAX_EMAIL_LENGTH = 254;
export const EMAIL_AUTH_MAX_PASSWORD_LENGTH = 128;

const EMAIL_SHAPE_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmailInput(raw: string): string {
  return raw.trim();
}

export function hasValidEmailShape(raw: string): boolean {
  const email = normalizeEmailInput(raw);

  if (email.length === 0 || email.length > EMAIL_AUTH_MAX_EMAIL_LENGTH) {
    return false;
  }

  return EMAIL_SHAPE_PATTERN.test(email);
}

export function hasValidPasswordLength(raw: string): boolean {
  return raw.length > 0 && raw.length <= EMAIL_AUTH_MAX_PASSWORD_LENGTH;
}
