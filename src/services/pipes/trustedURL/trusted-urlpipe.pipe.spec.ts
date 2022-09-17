import { TrustedURLPipePipe } from './trusted-urlpipe.pipe';

describe('TrustedURLPipePipe', () => {
  it('create an instance', () => {
    const pipe = new TrustedURLPipePipe();
    expect(pipe).toBeTruthy();
  });
});
