import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '../../../modules/user/model/user.model';

export const ROLES_KEY = 'roles';

// Usage: @Roles('supplier') on a handler (pair with RolesGuard).
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
