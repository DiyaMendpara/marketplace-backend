import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { User } from '../user/model/user.model';
import { Role } from '../role/model/role.model';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const buyerRole = { name: 'buyer', permissions: ['product.view'] };

describe('AuthService', () => {
  let service: AuthService;

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  };
  const roleModel = { findOne: jest.fn() };
  const jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('assigns the seeded role, hashes password, returns token + public user', async () => {
      userModel.findOne.mockResolvedValue(null);
      roleModel.findOne.mockResolvedValue({ _id: 'role1', ...buyerRole });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      userModel.create.mockResolvedValue({
        _id: 'u1',
        name: 'Jane',
        email: 'jane@nova.com',
        status: 'active',
        role: buyerRole,
        populate: jest.fn().mockResolvedValue(undefined),
      });

      const res = await service.register({
        name: 'Jane',
        email: 'Jane@Nova.com',
        password: 'secret123',
        role: 'buyer',
      } as never);

      expect(roleModel.findOne).toHaveBeenCalledWith({
        name: 'buyer',
        is_deleted: false,
      });
      expect(res).toMatchObject({
        data: {
          token: 'signed.jwt.token',
          user: expect.objectContaining({
            role: 'buyer',
            permissions: ['product.view'],
          }),
        },
      });
    });

    it('rejects a duplicate email', async () => {
      userModel.findOne.mockResolvedValue({ _id: 'exists' });
      await expect(
        service.register({
          name: 'J',
          email: 'j@n.com',
          password: 'secret123',
          role: 'buyer',
        } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('errors when the role is not seeded', async () => {
      userModel.findOne.mockResolvedValue(null);
      roleModel.findOne.mockResolvedValue(null);
      await expect(
        service.register({
          name: 'J',
          email: 'j@n.com',
          password: 'secret123',
          role: 'buyer',
        } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('login', () => {
    const userDoc = {
      _id: 'u1',
      email: 'jane@nova.com',
      name: 'Jane',
      password: 'hashed-pw',
      status: 'active',
      role: buyerRole,
    };
    const mockChain = (doc: unknown) =>
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(doc),
        }),
      });

    it('returns a token for valid credentials', async () => {
      mockChain(userDoc);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const res = await service.login({
        email: 'jane@nova.com',
        password: 'secret123',
      } as never);
      expect(res).toMatchObject({
        data: { token: 'signed.jwt.token', user: expect.objectContaining({ role: 'buyer' }) },
      });
    });

    it('rejects an invalid password', async () => {
      mockChain(userDoc);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'jane@nova.com', password: 'wrong' } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('rejects an unknown email', async () => {
      mockChain(null);
      await expect(
        service.login({ email: 'no@one.com', password: 'x' } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('rejects a deactivated account', async () => {
      mockChain({ ...userDoc, status: 'inactive' });
      await expect(
        service.login({ email: 'jane@nova.com', password: 'secret123' } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('getProfile', () => {
    it('returns the public user', async () => {
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'u1',
          name: 'Jane',
          email: 'jane@nova.com',
          role: buyerRole,
          status: 'active',
        }),
      });
      const res = await service.getProfile('u1');
      expect(res).toMatchObject({
        data: expect.objectContaining({ _id: 'u1', role: 'buyer' }),
      });
    });

    it('rejects when the user is missing', async () => {
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(service.getProfile('u1')).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('updateProfile', () => {
    it('updates fields and returns the public user', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'u1',
          name: 'Jane R',
          email: 'jane@nova.com',
          role: buyerRole,
          status: 'active',
        }),
      });
      const res = await service.updateProfile('u1', { name: 'Jane R' } as never);
      expect(res).toMatchObject({
        data: expect.objectContaining({ name: 'Jane R' }),
      });
    });
  });

  describe('changePassword', () => {
    it('re-hashes and saves when current password matches', async () => {
      const save = jest.fn();
      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'u1', password: 'hashed-old', save }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new');

      const res = await service.changePassword('u1', {
        currentPassword: 'oldpass',
        newPassword: 'newsecret1',
      } as never);

      expect(save).toHaveBeenCalled();
      expect(res).toMatchObject({ msg: expect.any(String) });
    });

    it('rejects an incorrect current password', async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'u1', password: 'hashed-old' }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword('u1', {
          currentPassword: 'wrong',
          newPassword: 'newsecret1',
        } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });
});
