import { ApiProperty } from '@nestjs/swagger';
import { BaseException } from './base-exception';

export class ValidationException extends BaseException {
  @ApiProperty({
    description: 'Validation errors',
    type: [String],
    example: ['Field userId is required', 'Field userId must be a number'],
  })
  errors: string[];

  constructor(errorCode: string, errorMessage: string, errors: string[]) {
    super(errorCode, errorMessage);
    this.errors = errors;
  }
}
