export const messages = {
  shared: {
    system_error: 'System error',
    invalid_request: 'Invalid request',
    not_found: 'Resource not found',
    success: 'Request successful',
    data_not_found: 'Data not found',
    bad_request: 'Bad Request',
    unauthorized: 'Unauthorized',
  },

  auth: {
    token_missing: 'Token missing',
    unauthorized: 'Unauthorized',
    invalid_token: 'Invalid or expired token',
    user_not_found: 'User not found',
    permissions_not_found: 'Permissions not found',
    no_permission: 'You do not have permission to perform this action',
    invalid_current_password: 'Your current password is incorrect',
    password_same: 'New password must be different from the current one',
    password_changed: 'Password changed successfully',
    account_deactivated: 'Your account has been deactivated. Please contact an administrator.',
    google_failed: 'Google sign-in failed. Please try again.',
  },

  user: {
    user_registered: 'Account created successfully',
    user_login: 'Logged in successfully',
    user_login_failed: 'Invalid email or password',
    user_not_found: "User doesn't exist",
    email_exists: 'An account with this email already exists',
    profile_fetched: 'Profile fetched successfully',
    profile_updated: 'Profile updated successfully',
    user_get: 'Users fetched successfully',
    user_status_updated: 'User status updated successfully',
    user_deleted: 'User deleted successfully',
  },

  role: {
    role_get: 'Roles fetched successfully',
    role_create: 'Role created successfully',
    role_update: 'Role updated successfully',
    role_delete: 'Role deleted successfully',
    role_not_found: 'Role not found',
    role_exists: 'A role with this name already exists',
    role_protected: 'This role is system-protected and cannot be modified',
  },
};
