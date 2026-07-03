import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGradeDto } from './create-grade.dto';

const validBase = {
  assignmentId: 1,
  studentId: '88aabefc-252d-4536-8dbc-6f2785ceda7e',
};

async function validateValue(value: unknown) {
  const dto = plainToInstance(CreateGradeDto, { ...validBase, value });
  return validate(dto);
}

describe('CreateGradeDto (value bounds)', () => {
  it('accepts a nominal value within [0, 20]', async () => {
    const errors = await validateValue(15);
    expect(errors).toHaveLength(0);
  });

  it('accepts the lower bound (0)', async () => {
    const errors = await validateValue(0);
    expect(errors).toHaveLength(0);
  });

  it('accepts the upper bound (20)', async () => {
    const errors = await validateValue(20);
    expect(errors).toHaveLength(0);
  });

  it('rejects a value below 0', async () => {
    const errors = await validateValue(-1);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('rejects a value above 20', async () => {
    const errors = await validateValue(21);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('max');
  });
});
