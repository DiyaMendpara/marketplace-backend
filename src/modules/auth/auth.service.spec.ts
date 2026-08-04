import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { User } from '../user/model/user.model';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('normalizes email, hashes password, and returns token + public user', async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      userModel.create.mockResolvedValue({
        _id: 'u1',
        name: 'Jane',
        email: 'jane@nova.com',
        role: 'buyer',
      });

      const res = await service.register({
        name: 'Jane',
        email: 'Jane@Nova.com',
        password: 'secret123',
        role: 'buyer',
      } as never);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'jane@nova.com',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', expect.any(Number));
      expect(res).toMatchObject({
        data: {
          token: 'signed.jwt.token',
          user: expect.objectContaining({
            email: 'jane@nova.com',
            role: 'buyer',
          }),
        },
      });
    });

    it('rejects a duplicate email', async () => {
      userModel.findOne.mockResolvedValue({ _id: 'exists' });

      await expect(
        service.register({
          name: 'Jane',
          email: 'jane@nova.com',
          password: 'secret123',
          role: 'buyer',
        } as never),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'u1',
          email: 'jane@nova.com',
          role: 'buyer',
          name: 'Jane',
          password: 'hashed-pw',
        }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.login({
        email: 'jane@nova.com',
        password: 'secret123',
      });

      expect(res).toMatchObject({ data: { token: 'signed.jwt.token' } });
    });

    it('rejects an invalid password', async () => {
      userModel.findOne.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ _id: 'u1', password: 'hashed-pw' }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'jane@nova.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('rejects an unknown email', async () => {
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({ email: 'no@one.com', password: 'x' }),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('getProfile', () => {
    it('returns the public user', async () => {
      userModel.findById.mockResolvedValue({
        _id: 'u1',
        name: 'Jane',
        email: 'jane@nova.com',
        role: 'buyer',
      });

      const res = await service.getProfile('u1');
      expect(res).toMatchObject({
        data: expect.objectContaining({ _id: 'u1' }),
      });
    });

    it('rejects when the user is missing', async () => {
      userModel.findById.mockResolvedValue(null);
      await expect(service.getProfile('u1')).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });
});
