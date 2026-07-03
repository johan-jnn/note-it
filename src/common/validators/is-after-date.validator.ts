import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates that the decorated date property is strictly after another
 * date property of the same object. Skipped (valid) if either value is
 * missing, since presence is handled by other decorators (@IsNotEmpty/@IsOptional).
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          if (relatedValue == null || value == null) {
            return true;
          }
          const relatedDate = new Date(relatedValue as string);
          const currentDate = new Date(value as string);
          return currentDate.getTime() > relatedDate.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
