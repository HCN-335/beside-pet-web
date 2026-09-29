import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTypewriter } from './typewriter';

describe('typewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('drains all text before completing exactly once', () => {
    const onText = vi.fn();
    const onComplete = vi.fn();
    const writer = createTypewriter({ onText, onComplete });
    writer.push('hello');
    writer.finish();

    vi.runAllTimers();

    expect(onText).toHaveBeenLastCalledWith('hello');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cancels without completing', () => {
    const onComplete = vi.fn();
    const writer = createTypewriter({ onText: vi.fn(), onComplete });
    writer.push('hello');
    writer.finish();
    writer.cancel();

    vi.runAllTimers();

    expect(onComplete).not.toHaveBeenCalled();
  });
});
