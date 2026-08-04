import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './model/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email: email.trim().toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  toPublic(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      phone: user.phone,
    };
  }
}
