import { newRequestSchema } from './newRequestSchema';

// 2099-11-02 is a Monday; far in the future so "not in the past" never depends on today
const valid = {
  type: 'vacation',
  startDate: '2099-11-02',
  endDate: '2099-11-06',
  note: 'Family trip',
} as const;

// The first error message for a field, or undefined
const errorFor = (input: object, field: string) => {
  const result = newRequestSchema.safeParse(input);
  return result.success
    ? undefined
    : result.error.issues.find((issue) => issue.path[0] === field)?.message;
};

describe('newRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(newRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('trims the note and turns a blank note into no note', () => {
    expect(newRequestSchema.parse({ ...valid, note: '  Trip  ' }).note).toBe('Trip');
    expect(newRequestSchema.parse({ ...valid, note: '   ' }).note).toBeUndefined();
  });

  it.each([
    ['a missing type', { ...valid, type: '' }, 'type', 'Choose a type'],
    ['a missing start date', { ...valid, startDate: '' }, 'startDate', 'Choose a start date'],
    ['a missing end date', { ...valid, endDate: '' }, 'endDate', 'Choose an end date'],
    [
      'an end date before the start date',
      { ...valid, endDate: '2099-11-01' },
      'endDate',
      "The end date can't be before the start date",
    ],
    [
      'a weekend only',
      { ...valid, startDate: '2099-11-07', endDate: '2099-11-08' },
      'endDate',
      'Choose at least one working day',
    ],
    [
      'a vacation in the past',
      { ...valid, startDate: '2000-01-03', endDate: '2000-01-04' },
      'startDate',
      "The start date can't be in the past (except for sick leave)",
    ],
    [
      'a note that is too long',
      { ...valid, note: 'a'.repeat(501) },
      'note',
      'Keep the note under 500 characters',
    ],
  ] as const)('rejects %s', (_label, input, field, message) => {
    expect(errorFor(input, field)).toBe(message);
  });

  it('allows sick leave in the past', () => {
    const sick = { ...valid, type: 'sick', startDate: '2000-01-03', endDate: '2000-01-04' };
    expect(newRequestSchema.safeParse(sick).success).toBe(true);
  });
});
