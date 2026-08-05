import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from '../../role/model/role.model';
import roles from '../../../fixtures/roles';

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async seed() {
    for (const role of roles) {
      await this.roleModel.updateOne(
        { name: role.name },
        {
          $set: {
            permissions: role.permissions,
            description: role.description,
            is_deleted: false,
          },
          // Set on insert ensures that 'name' is inserted when the document is created
          $setOnInsert: { name: role.name }
        },
        { upsert: true }
      );
    }
    this.logger.log('Roles seeded');
  }
}
