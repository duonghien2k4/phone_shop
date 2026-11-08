import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  const canActivateFor = (email: string, role: string) => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { email, role } }),
      }),
    } as unknown as ExecutionContext;

    return guard.canActivate(context);
  };

  it('allows ADMIN only for the designated account', () => {
    expect(canActivateFor('admin@socmobile.vn', 'ADMIN')).toBe(true);
    expect(canActivateFor('ADMIN@SOCMOBILE.VN', 'ADMIN')).toBe(true);
    expect(canActivateFor('vutuankien2004gmail.cm', 'ADMIN')).toBe(false);
  });
});
