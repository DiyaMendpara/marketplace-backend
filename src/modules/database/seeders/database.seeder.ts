import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { RoleSeeder } from './role.seeder';
import { SuperAdminSeeder } from './super-admin.seeder';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly superAdminSeeder: SuperAdminSeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting database seeding...');
    try {
      // Order matters: roles first, then the super admin (which needs the role).
      await this.roleSeeder.seed();
      await this.superAdminSeeder.seed();
      this.logger.log('Database seeding complete');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Seeding failed: ${message}`);
    }
  }
}
