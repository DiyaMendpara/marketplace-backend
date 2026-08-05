import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { Role } from '../../role/model/role.model';
import { User } from '../../user/model/user.model';

@Injectable()
export class SuperAdminSeeder {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    const superRole = await this.roleModel.findOne({ name: 'super admin' });
    if (!superRole) {
      this.logger.warn('super admin role not found; skipping super admin seed');
      return;
    }

    const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@loomly.com')
      .trim()
      .toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    await this.userModel.updateOne(
      { email },
      {
        $set: {
          role: superRole._id,
          status: 'active',
          is_disabled: false,
          is_deleted: false,
          isSystemGenerated: true,
        },
        $setOnInsert: {
          name: 'System Administrator',
          email,
          password: hashed,
        }
      },
      { upsert: true }
    );
    this.logger.log(`Super admin ensured: ${email}`);
  }
}
