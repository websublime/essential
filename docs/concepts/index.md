# Concepts

## install

You can install `@websublime/forms` via npm or yarn using the following command:

```bash
npm @websublime/forms --save
# or
yarn add @websublime/forms
```

## usage

```typescript
import { NumberType } from '@websublime/schema';
import { FormControl } from '@websublime/forms';

const schema = NumberType()
  .isRequired()
  .max(10);

const control = new FormControl(schema);
```
