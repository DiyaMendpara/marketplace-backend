import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, RoleSchema } from '../role/model/role.model';
import { User, UserSchema } from '../user/model/user.model';
import { DatabaseSeeder } from './seeders/database.seeder';
import { RoleSeeder } from './seeders/role.seeder';
import { SuperAdminSeeder } from './seeders/super-admin.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DatabaseSeeder, RoleSeeder, SuperAdminSeeder],
})
export class DatabaseModule {}
