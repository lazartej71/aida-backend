export function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (
    !secret ||
    Buffer.byteLength(secret, 'utf8') < 32 ||
    secret.trim().length === 0
  ) {
    throw new Error(
      'JWT_SECRET debe configurarse con un secreto de al menos 32 bytes.',
    );
  }
  return secret;
}
