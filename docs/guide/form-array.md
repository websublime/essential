# Form Array

`FormArray` is used to map arrays in an object model.

We can say a `FormArray` is a list of UI forms or UI form controls.

## Validation

The follwing code create a validation schema for a array of numbers.

The schema:

```typescript
const schema = ArrayType(
  NumberType()
    .isRequired()
    .min(2)
);
```

Then we can create a `FormArray` for this validation schema.

```typescript
const fa = new FormArray(schema);
```

Validate a element from the list.

```typescript
fa.setData([1, 2, 3, null]);

await fa.items[3].validate(); // validate bottom up.

expect(fa.isValid).toBeFalsy();
expect(fa.errors.length).toBe(0);

expect(fa.items[0].isValid).toBeTruthy(); // still valid
expect(fa.items[1].isValid).toBeTruthy(); // still valid
expect(fa.items[2].isValid).toBeTruthy(); // still valid
expect(fa.items[3].isValid).toBeFalsy();
```

:::info Note
The code `fa.items[3].validate()` only validates the fourth item of the array an propagate the validation to the top.
:::

Validate all elements of the array

```typescript
await fa.validateAll();

expect(fa.isValid).toBeFalsy();

expect(fa.items[0].isValid).toBeFalsy();
console.log(fa.items[0].errors[0].i18n); // ERRORS.NUMBER.MIN

expect(fa.items[1].isValid).toBeTruthy();
expect(fa.items[2].isValid).toBeTruthy();

expect(fa.items[3].isValid).toBeFalsy();
console.log(fa.items[3].errors[0]);

// {
//   key: 3,
//   i18n: 'ERRORS.IS_REQUIRED',
//   constraints: null,
//   value: null
// }

expect(fa.errors.length).toBe(0);
```

## FormArray of FormGroups

Example of an FormArray with FormGroup.

```typescript
const schema = ArrayType(
  ObjectType({
    email: StringType().isEmail(),
    age: NumberType().min(18)
  })
).minLength(3);

const fa = new FormArray(schema);

fa.setData([
  { email: 'test', age: 10 },
  { email: 'test@test.com', age: null }
]);

await fa.validateAll();

expect(fa.isValid).toBeFalsy();

const [fgItem1, fgItem2] = fa.items;

expect(fgItem1.isValid).toBeFalsy();
expect(fgItem1.properties.email.isValid).toBeFalsy();

console.log(fgItem1.properties.email.errors);

// [
//   {
//     key: 'email',
//     i18n: 'ERRORS.STRING.IS_EMAIL',
//     constraints: null,
//     value: 'test'
//   }
// ]

expect(fgItem2.isValid).toBeTruthy();
```
