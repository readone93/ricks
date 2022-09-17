import { NegativeNumberPipe } from './negative-number.pipe';

describe('NegativeNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NegativeNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
