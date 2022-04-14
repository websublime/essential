# What is Forms?

`@websublime/forms` package is a form validation model and rely on `@websublime/schema` package to make validations.

`@websublime/forms` package is based on `angular` forms model, to make form validation easy.

`@websublime/forms` package is framework agnostic.

## Motivation

Forms was created to take advantage of a schema validation `@websublime/schema` and apply to form validation.

Is based on `angular` forms model, taking laverage of schema validation and yet very complete.

All validation rules are defined in the schema and are async and run async, in order of it definition.

It also have two ways of validate a model:

- From top to bottom. It will validate all form fields.

- And from bottom to top. It very useful to be used with single form control validation.
  When you fill a form with several fields, we don't all fields to be validation at same time. Only if they are changed.

## Concepts

To create a form we use three concepts:

- Model - A javascript object.

- Validation Schema - A schema object with validation rules, that describes the `Model`.

- Forms Model - A forms model based on the `Validation Schema`.

- Provider component - A component to trigger form control validation.

### Model

```typescript
class User {
  name: string;
  age: number;
  email: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
```

### Validation Schema

```typescript
const schema = ObjectType<User>({
  name: StringType().isRequired(),
  age: NumberType().min(18),
  email: StringType().isEmail()
});
```

### Form model

```typescript
const fg = new FormGroup(schema);

expect(control.isFocus).toBeFalsy();
expect(control.isDirty).toBeFalsy();
expect(control.isTouch).toBeFalsy();
expect(control.isPrestine).toBeTruthy();
expect(control.isValid).toBeTruthy();
expect(control.hasErrors).toBeFalsy();
```

### Validate

```typescript
control.setData(
  new User({
    age: 10,
    email: 'teste.com',
    name: 'test'
  })
);

await control.validate();
```

### Provider Component

```html
<form-control :form-control="fg.name">
  <v-text-field
    v-model="user.name"
    #default="{ on , errors}"
    :error-messages="errors"
    v-on="on"
  />
</form-control>
```

::: info Note
Example in VueJs wrapping the form control provider component with a `v-text-field` from a popular ui framework `vuetifyjs`
