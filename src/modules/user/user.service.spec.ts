import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './model/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail lowercases the email and selects the password when asked', () => {
    const exec = jest.fn();
    const select = jest.fn().mockReturnValue({ exec });
    userModel.findOne.mockReturnValue({ select, exec });

    service.findByEmail('Jane@Nova.com', true);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'jane@nova.com' });
    expect(select).toHaveBeenCalledWith('+password');
  });

  it('findById delegates to the model', () => {
    const exec = jest.fn();
    userModel.findById.mockReturnValue({ exec });

    service.findById('u1');

    expect(userModel.findById).toHaveBeenCalledWith('u1');
  });

  it('toPublic never exposes the password', () => {
    const pub = service.toPublic({
      _id: 'u1',
      name: 'Jane',
      email: 'jane@nova.com',
      role: 'buyer',
      password: 'hashed-pw',
    } as never);

    expect(pub).not.toHaveProperty('password');
    expect(pub).toMatchObject({ _id: 'u1', role: 'buyer' });
  });
});
