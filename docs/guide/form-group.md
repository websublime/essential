# Form Group

`FormGroup` is used to map objects in an object model.

Most of the UI forms have several input components. Each input component is linked to a `FormControl` and grouped into a `FormGroup`.

We can say a `FormGroup` is linked to an UI form.

## Validation

The follwing code create a validation schema for a object with three properties.

The model:

```typescript
class User {
  age: number;
  email: string;
  name: string;

  constructor(data?: Partial<User>) {
    object.assign(this, data);
  }
}
```

The schema:

```typescript
const schema = ObjectType<User>({
  age: NumberType()
    .isRequired()
    .min(18),
  email: StringType()
    .isRequired()
    .isEmail(),
  name: StringType().isRequired()
});
```

Then we can create a GroupControl for this validation schema.

```typescript
const fg = new FormGroup(schema);

expect(fg.properties.age).toBeDefined();
expect(fg.properties.email).toBeDefined();
expect(fg.properties.name).toBeDefined();
```

::: info Note
The `FormGroup` object will create `FormControl` object for each property.
:::

### Single Control (Bottom up validation)

The following code, show how the `validate` method works.

Validate will validate from bottom to top.
So it will execute all validation rules for the age property:

- isRequired()
- max(10)

And then it goes up and execute all rules defined for the ObjectType. Is this case it's none.

```typescript
fg.setData({
  age: 10,
  email: null,
  name: null
});

await fg.properties.age.validate();

expect(fg.properties.age.isValid).toBeFalsy();
expect(fg.properties.email.isValid).toBeTruthy();
expect(fg.properties.name.isValid).toBeTruthy();
expect(fg.isValid).toBeFalsy();
```

### Validate All (Top to Bottom)

`validateAll` method will validate all rules defined at object level and will drill down the properties.

Everything will be validated.

```typescript
fg.setData({
  age: 10,
  email: null,
  name: null
});

await fg.validateAll();

expect(fg.properties.age.isValid).toBeFalsy();
const [ageError] = fg.properties.age.errors;
console.log(ageError);

// {
//   key: 'age',
//   i18n: 'ERRORS.NUMBER.MIN',
//   constraints: { min: 18 },
//   value: 10
// }

expect(fg.properties.email.isValid).toBeFalsy();
const [emailError] = fg.properties.email.errors;
console.log(emailError);

// {
//   key: 'email',
//   i18n: 'ERRORS.IS_REQUIRED',
//   constraints: null,
//   value: null
// }

expect(fg.properties.name.isValid).toBeFalsy();
const [nameError] = fg.properties.email.errors;
console.log(nameError);

// {
//   key: 'email',
//   i18n: 'ERRORS.IS_REQUIRED',
//   constraints: null,
//   value: null
// }

expect(fg.errors.length).toBe(0);
expect(fg.isValid).toBeFalsy();
```

## Change state

The following code show that changing the state for a nested control it will propagate to the top.

```typescript
const schema = ObjectType<User>({
  age: NumberType()
    .isRequired()
    .min(18),
  email: StringType()
    .isRequired()
    .isEmail(),
  name: StringType().isRequired()
});

const fg = new FormGroup(schema);

fg.properties.age.setDirty();

expect(fg.properties.age.isDirty).toBeTruthy(); // age is dirty
expect(fg.properties.name.isDirty).toBeFalsy(); // name is not dirty
expect(fg.properties.email.isDirty).toBeFalsy(); // email is dirty

expect(fg.isDirty).toBeTruthy(); // fg is dirty.
```

## Nested FormGroups

Form object model is based on schema validation objects. Schema validation object can describe any type of JSON object.

So to have nested `FormGroup`s we simple need to define a schema with nested objects.

The code bellow show the definition of a schema that describes a nested object.

```typescript
const schema = ObjectType({
  age: NumberType()
    .isRequired()
    .min(18),
  name: StringType().isRequired(),
  contact: ObjectType({
    email: StringType()
      .isRequired()
      .isEmail('CUSTOM.MESSAGE'),
    phone: StringType().isRequired()
  })
});
```

Then we only need to pass the schema to the FormGroup object.

```typescript
const fg = new FormGroup(schema);

fg.setData({
  age: 10,
  name: 'test',
  contact: {
    email: 'teste',
    phone: '222444222'
  }
});
```

The code below show how we can access the `FormGroup` for nested object `contact`.

It show that when we validate `emailFormControl` the validation is propagated to the top.

**Note** the propagation is bottom up. Sibbling controls will not be affected.

```typescript
const fgContact = fg.properties.contact; // access the FormGroup for nested object contact

expect(fgContact instanceof FormGroup).toBeTruthy();

const emailFormControl = fgContact.properties.email;
const phoneFormControl = fgContact.properties.phone;

await emailFormControl.validate(); // validate email control. It will propagate the validation to the top.

expect(emailFormControl.isValid).toBeFalsy();
expect(phoneFormControl.isValid).toBeTruthy(); // is still valid.
expect(fgContact.isValid).toBeFalsy();
expect(fg.properties.name.isValid).toBeTruthy(); // is still valid
expect(fg.isValid).toBeFalsy();

expect(fg.hasErrors).toBeFalsy();
expect(emailFormControl.hasErrors).toBeTruthy();
expect(emailFormControl.errors[0].i18n).toBe('CUSTOM.MESSAGE'); // custom message defined on the schema
```

Code below show how to validate all the form, including nested `FormGroup`s (Top to Bottom)

```typescript
fg.setData({
  age: 19,
  name: 'test',
  contact: {
    email: 'huzgo1@gmail.com',
    phone: '222444222'
  }
});

await fg.validateAll();

expect(fg.isValid).toBeTruthy();
expect(fgContact.isValid).toBeTruthy();
expect(emailFormControl.isValid).toBeTruthy();
expect(fg.hasErrors).toBeFalsy();
```
