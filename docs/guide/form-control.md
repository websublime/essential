# FormControl

FormControl is used to map properties in an object model.

Most of the UI components will be linked to this control.

## Validation

To create any form object model, we need first to create a validation schema.

The follwing code create a validation schema for a property that must be of type `number`, is `required` and the `max` value is `10`

```typescript
const schema = NumberType()
  .isRequired()
  .max(10);
```

Then we can create a FormControl for this validation schema.

```typescript
const control = new FormControl(schema);

control.setData(11); // does not trigger a validation

expect(control.isValid).toBeTruthy();
expect(control.hasErrors).toBeFalsy();

await control.validate();

expect(control.isValid).toBeFalsy();
expect(control.hasErrors).toBeTruthy();

console.log(control.errors[0].i18n); // ERRORS.NUMBER.MAX
console.log(control.errors[0].constraints); // { max: 10 }
console.log(control.errors[0].value); // 11
```

::: info Note
Setting a value do not trigger the validation
:::

## Change state

The following code show that setting data to be validated or executing validation do not change the control state for `isDirty`, `isPrestine` or `isTouch`

We have methods to form the change of these states:

- **setDirty**
- **setFocus**
- **setTouch**

:::info Note
If the control has a parent (belong to a `FormGroup` or `FormArray`) the state will be propagated until the root.
:::

```typescript
const schema = NumberType()
  .isRequired()
  .max(10);

const control = new FormControl(schema);

control.setData(11); // do not change control state

expect(control.isDirty).toBeFalsy();
expect(control.isPrestine).toBeTruthy();
expect(control.isTouch).toBeFalsy();
expect(control.isValid).toBeTruthy();

await control.validate(); // only change isValid

expect(control.isDirty).toBeFalsy();
expect(control.isPrestine).toBeTruthy();
expect(control.isTouch).toBeFalsy();
expect(control.isValid).toBeFalsy(); // Changed

control.setDirty();

expect(control.isDirty).toBeTruthy();
expect(control.isPrestine).toBeFalsy();
expect(control.isTouch).toBeTruthy();
expect(control.isValid).toBeFalsy();
```
