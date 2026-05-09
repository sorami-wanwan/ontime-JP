import { formatDelay } from '../rundownEvent.utils';

describe('formatDelay()', () => {
  it('adds a given delay to the start time', () => {
    const timeStart = 60000; // 1 min
    const delay = 60000; // 1 min
    const getLocalizedString = (_key: any) => 'New start {{0}}';
    const result = formatDelay(timeStart, delay, getLocalizedString);
    expect(result).toEqual('New start 00:02');
  });
});
