import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseException extends Error {
  @ApiProperty({
    example: 'E0001',
    description: 'Error code',
  })
  errorCode: string;

  @ApiProperty({
    example: 'Bad request',
    description: 'Error message',
  })
  errorMessage: string;

  @ApiProperty({
    example: '1634027610000',
    description: 'Unix timestamp in milliseconds',
  })
  timestamp: string;

  @ApiPropertyOptional({
    example: 'Exception at SomeClass.method (/controller.ts:49:11)',
    description: 'Exception stacktrace',
  })
  trace?: string;

  @ApiPropertyOptional({
    example: '27fd427b-bace-48dc-a4aa-95d4cb3d51b9',
    description: 'Trace ID of the request',
  })
  traceId?: string;

  status: number;

  constructor(
    errorCode: string,
    errorMessage: string,
    httpStatus = 400,
    timestamp?: string,
  ) {
    super(errorMessage);

    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.timestamp = timestamp ?? Date.now().toString();
    this.status = httpStatus;
    this.trace = this.stack;
  }

  setTraceId(traceId: string) {
    this.traceId = traceId;
  }

  setTrace(trace: string) {
    this.trace = trace;
  }
}
