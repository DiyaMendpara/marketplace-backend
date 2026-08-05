import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('register delegates to the service', async () => {
    authService.register.mockResolvedValue('REGISTERED');
    await expect(
      controller.register({ email: 'a@b.com' } as never),
    ).resolves.toBe('REGISTERED');
    expect(authService.register).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('login delegates to the service', async () => {
    authService.login.mockResolvedValue('LOGGED_IN');
    await expect(
      controller.login({ email: 'a@b.com', password: 'x' }),
    ).resolves.toBe('LOGGED_IN');
  });

  it('getProfile passes the authenticated user id through', async () => {
    authService.getProfile.mockResolvedValue('PROFILE');
    await expect(controller.getProfile('u1')).resolves.toBe('PROFILE');
    expect(authService.getProfile).toHaveBeenCalledWith('u1');
  });

  it('updateProfile passes user id + body through', async () => {
    authService.updateProfile.mockResolvedValue('UPDATED');
    await expect(
      controller.updateProfile('u1', { name: 'Jane' } as never),
    ).resolves.toBe('UPDATED');
    expect(authService.updateProfile).toHaveBeenCalledWith('u1', { name: 'Jane' });
  });

  it('changePassword passes user id + body through', async () => {
    authService.changePassword.mockResolvedValue('CHANGED');
    await expect(
      controller.changePassword('u1', {
        currentPassword: 'a',
        newPassword: 'bbbbbb',
      } as never),
    ).resolves.toBe('CHANGED');
    expect(authService.changePassword).toHaveBeenCalledWith('u1', {
      currentPassword: 'a',
      newPassword: 'bbbbbb',
    });
  });
});
