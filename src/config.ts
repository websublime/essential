/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { ConfigureStoreOptions } from '@reduxjs/toolkit';
import { Environment } from './types';

const env = (process.env.NODE_ENV || 'production') as Environment;

const config = {
  devTools: env !== 'production'
};

const defineStoreOptions = (options: ConfigureStoreOptions) => {
  return Object.assign(config, options);
}

export {
  config,
  defineStoreOptions
}
