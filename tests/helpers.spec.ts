import { isSsr, uniqueID, isEmpty, isNil } from '../src/helpers';

describe('> Helpers', () => {
  test('Should test platform', () => {
    expect(isSsr()).toBe(true);
  });

  test('Should test id generation', () => {
    const id = uniqueID();

    expect(typeof id).toBe('string');
  });

  test('Should test value is empty', () => {
    const isNull = isEmpty(null);
    const isUndefined = isEmpty(undefined);
    const isValid = isEmpty(1);

    expect(isNull).toBeTruthy();
    expect(isUndefined).toBeTruthy();
    expect(isValid).toBeFalsy();
  });

  test('Should test is null or undefined', () => {
    const isNull = isNil(null);
    const isUndefined = isNil(undefined);
    const isNotValid = isNil(1);

    expect(isNull).toBeTruthy();
    expect(isUndefined).toBeTruthy();
    expect(isNotValid).toBeFalsy();
  });
});
