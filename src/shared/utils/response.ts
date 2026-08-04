import { HttpException, HttpStatus } from '@nestjs/common';

const sendBadRequest = (msg = 'Bad Request') => {
  throw new HttpException(
    {
      error: 'Bad Request',
      message: msg,
    },
    HttpStatus.BAD_REQUEST,
  );
};

const sendSuccess = (
  msg = 'Success',
  data?: unknown,
  meta: Record<string, unknown> = {},
) => {
  return {
    msg,
    data,
    meta: meta,
  };
};

const sendSystemError = (msg = 'System error.') => {
  throw new HttpException(
    {
      error: 'System error',
      message: msg,
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

const sendUnauthorized = (msg = 'Unauthorized') => {
  throw new HttpException(
    {
      error: 'Unauthorized',
      message: msg,
    },
    HttpStatus.UNAUTHORIZED,
  );
};

const sendNotFound = (msg = 'Not Found') => {
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
