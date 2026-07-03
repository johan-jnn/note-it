import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAssignmentDto } from './create-assignment.dto';

const validBase = {
  title: 'Homework',
  lessonId: 1,
  scale: 20,
};

async function validateDto(overrides: Record<string, unknown>) {
  const dto = plainToInstance(CreateAssignmentDto, {
    ...validBase,
    ...overrides,
  });
  return validate(dto);
}

describe('CreateAssignmentDto (scale/coefficient positivity)', () => {
  it('accepts a nominal positive scale and coefficient', async () => {
    const errors = await validateDto({ scale: 20, coefficient: 2 });
    expect(errors).toHaveLength(0);
  });

  it('accepts the lower bound scale of 1', async () => {
    const errors = await validateDto({ scale: 1 });
    expect(errors).toHaveLength(0);
  });

  it('rejects a scale of 0', async () => {
    const errors = await validateDto({ scale: 0 });
    expect(errors.some((e) => e.property === 'scale')).toBe(true);
  });

  it('rejects a negative scale', async () => {
    const errors = await validateDto({ scale: -5 });
    expect(errors.some((e) => e.property === 'scale')).toBe(true);
  });

  it('rejects a coefficient of 0', async () => {
    const errors = await validateDto({ coefficient: 0 });
    expect(errors.some((e) => e.property === 'coefficient')).toBe(true);
  });

  it('rejects a negative coefficient', async () => {
    const errors = await validateDto({ coefficient: -1 });
    expect(errors.some((e) => e.property === 'coefficient')).toBe(true);
  });
});

describe('CreateAssignmentDto (begin_date/end_date coherence)', () => {
  it('accepts a nominal case where begin_date is before end_date', async () => {
    const errors = await validateDto({
      begin_date: '2026-01-01T00:00:00.000Z',
      end_date: '2026-01-02T00:00:00.000Z',
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts when only one of the two dates is provided', async () => {
    const errors = await validateDto({
      begin_date: '2026-01-01T00:00:00.000Z',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects when end_date is before begin_date', async () => {
    const errors = await validateDto({
      begin_date: '2026-01-02T00:00:00.000Z',
      end_date: '2026-01-01T00:00:00.000Z',
    });
    expect(errors.some((e) => e.property === 'end_date')).toBe(true);
  });

  it('rejects when end_date equals begin_date', async () => {
    const errors = await validateDto({
      begin_date: '2026-01-01T00:00:00.000Z',
      end_date: '2026-01-01T00:00:00.000Z',
    });
    expect(errors.some((e) => e.property === 'end_date')).toBe(true);
  });
});
