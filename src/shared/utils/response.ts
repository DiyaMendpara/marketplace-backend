import { HttpException, HttpStatus } from '@nestjs/common';
import { messages } from './messages';

const sendBadRequest = (msg = messages.shared.bad_request) => {
  throw new HttpException(
    {
      error: 'Bad Request',
      message: msg,
    },
    HttpStatus.BAD_REQUEST,
  );
};

const sendSuccess = (
  msg = messages.shared.success,
  data?: unknown,
  meta: Record<string, unknown> = {},
) => {
  return {
    msg,
    data,
    meta: meta,
  };
};

const sendSystemError = (msg = messages.shared.system_error) => {
  throw new HttpException(
    {
      error: 'System error',
      message: msg,
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

const sendUnauthorized = (msg = messages.shared.unauthorized) => {
  throw new HttpException(
    {
      error: 'Unauthorized',
      message: msg,
    },
    HttpStatus.UNAUTHORIZED,
  );
};

const sendNotFound = (msg = messages.shared.not_found) => {
  throw new HttpException(
    {
      error: 'Not Found',
      message: msg,
    },
    HttpStatus.NOT_FOUND,
  );
};

export {
  sendBadRequest,
  sendNotFound,
  sendSuccess,
  sendSystemError,
  sendUnauthorized,
};
