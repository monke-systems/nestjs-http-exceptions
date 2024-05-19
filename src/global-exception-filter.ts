import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import {
  BadRequestException,
  Catch,
  HttpException,
  Optional,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { BaseException } from './base-exception';
import { ValidationException } from './validation-exception';

type ParsedException = {
  httpStatus: number;
  body: BaseException;
};

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional()
    private cls?: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const parsed = this.parseException(exception);

    if (parsed.body.traceId === undefined && this.cls !== undefined) {
      parsed.body.setTraceId(this.cls.getId());
    }

    // serialization stack in JS ecosystem is trash
    const plain = Object.assign({}, parsed.body);
    // @ts-expect-error yes, it is
    delete plain.status;

    return response.status(parsed.httpStatus).send(plain);
  }

  private parseException(exception: unknown): ParsedException {
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      // detect nestjs internal validation pipe response
      // dirty
      if (
        typeof response === 'object' &&
        'message' in response &&
        Array.isArray(response.message)
      ) {
        const base = new ValidationException(
          'VALIDATOR',
          'Bad request',
          response.message,
        );

        return {
          httpStatus: exception.getStatus(),
          body: base,
        };
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const trace = exception.stack;

      const base = new BaseException(`HTTP${status}`, exception.message);

      if (trace !== undefined) {
        base.setTrace(trace);
      }

      return {
        httpStatus: status,
        body: base,
      };
    }

    if (exception instanceof BaseException) {
      return {
        httpStatus: exception.status,
        body: exception,
      };
    }

    if (exception instanceof Error) {
      const base = new BaseException('HTTP500', 'Internal server error');

      if (exception.stack !== undefined) {
        base.setTrace(exception.stack);
      }

      return {
        httpStatus: 500,
        body: base,
      };
    }

    return {
      httpStatus: 500,
      body: new BaseException('HTTP500', 'Internal server error'),
    };
  }
}
