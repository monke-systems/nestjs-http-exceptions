import {
  BaseException,
  GlobalHttpExceptionFilter,
  ValidationException,
} from '../../src';

describe('exports test', () => {
  it('package exports modules', () => {
    expect(GlobalHttpExceptionFilter).toBeDefined();
    expect(BaseException).toBeDefined();
    expect(ValidationException).toBeDefined();
  });
});
