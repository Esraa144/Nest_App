import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Check_fields_Exists', async: false })
export class CheckIfAnyFieldAreApplied 
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
  
    return (Object.keys(args.object).length>0&&
    Object.values(args.object).filter((arg)=>{
      return arg !=undefined
    }).length>0
  );
  }
  defaultMessage(ValidationArguments?: ValidationArguments): string {
    return `All update Fields are empty`;
  }
}

export function ContainField(
  validationOptions?: ValidationOptions,
) {
  return function (constructor:Function) {
    registerDecorator({
      target:constructor,
      propertyName: undefined!,
      options: validationOptions,
      constraints:[],
      validator: CheckIfAnyFieldAreApplied,
    });
  };
}
