export const messages = {
  shared: {
    system_error: 'System error',
    invalid_request: 'Invalid request',
    not_found: 'Resource not found',
    success: 'Request successful',
    data_not_found: 'Data not found',
  },

  auth: {
    token_missing: 'Token missing',
    unauthorized: 'Unauthorized',
    invalid_token: 'Invalid or expired token',
    user_not_found: 'User not found',
    permissions_not_found: 'Permissions not found',
    no_permission: 'You do not have permission to perform this action',
  },

  user: {
    user_registered: 'Account created successfully',
    user_login: 'Logged in successfully',
    user_login_failed: 'Invalid email or password',
    user_not_found: "User doesn't exist",
    email_exists: 'An account with this email already exists',
    profile_fetched: 'Profile fetched successfully',
  },
};
