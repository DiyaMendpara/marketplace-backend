import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './model/user.model';
import { Role } from '../role/model/role.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const roleModel = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('toPublic resolves the populated role name + permissions, never the password', () => {
    const pub = service.toPublic({
      _id: 'u1',
      name: 'Jane',
      email: 'jane@nova.com',
      role: { name: 'buyer', permissions: ['product.view'] },
      status: 'active',
      password: 'hashed',
    } as never);

    expect(pub).not.toHaveProperty('password');
    expect(pub).toMatchObject({
      _id: 'u1',
      role: 'buyer',
      permissions: ['product.view'],
      status: 'active',
    });
  });

  it('getAllUsers excludes deleted and maps a role-name filter to its id', async () => {
    roleModel.findOne.mockResolvedValue({ _id: 'role1', name: 'supplier' });
    userModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      }),
    });

    await service.getAllUsers({ role: 'supplier' } as never);

    expect(roleModel.findOne).toHaveBeenCalledWith({ name: 'supplier' });
    expect(userModel.find).toHaveBeenCalledWith({
      is_deleted: false,
      role: 'role1',
    });
  });

  it('setActive maps the boolean to a status and returns the public user', async () => {
    userModel.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'u1',
        name: 'Jane',
        email: 'jane@nova.com',
        role: { name: 'buyer', permissions: [] },
        status: 'inactive',
      }),
    });

    const res = await service.setActive('u1', false);

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1', is_deleted: false },
      { $set: { status: 'inactive' } },
      { new: true },
    );
    expect(res).toMatchObject({ data: expect.objectContaining({ status: 'inactive' }) });
  });

  it('deleteUser soft-deletes', async () => {
    userModel.findOneAndUpdate.mockResolvedValue({ _id: 'u1' });
    const res = await service.deleteUser('u1');
    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1', is_deleted: false },
      { $set: { is_deleted: true } },
    );
    expect(res).toMatchObject({ msg: expect.any(String) });
  });

  it('deleteUser rejects a missing user', async () => {
    userModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(service.deleteUser('u1')).rejects.toBeInstanceOf(HttpException);
  });
});
