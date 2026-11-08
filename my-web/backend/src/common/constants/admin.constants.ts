export const SOLE_ADMIN_EMAIL = 'admin@socmobile.vn';

export function isSoleAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SOLE_ADMIN_EMAIL;
}

export function getEffectiveRole(email: string, role: string): string {
  return role === 'ADMIN' && !isSoleAdminEmail(email) ? 'CUSTOMER' : role;
}
