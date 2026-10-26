import { delay } from './simulate';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('delay', () => {
  it('should not resolve before the delay has elapsed', async () => {
    const onResolve = vi.fn();
    void delay().then(onResolve);

    await vi.advanceTimersByTimeAsync(499);

    expect(onResolve).not.toHaveBeenCalled();
  });

  it('should resolve once the delay has elapsed', async () => {
    const onResolve = vi.fn();
    void delay().then(onResolve);

    await vi.advanceTimersByTimeAsync(5000);

    expect(onResolve).toHaveBeenCalledOnce();
  });
});
