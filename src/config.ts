/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { ConfigureStoreOptions } from '@reduxjs/toolkit';
import { hasBrowserEnvironment } from './helpers';
import { Environment } from './types';

const env = (hasBrowserEnvironment || process.env.NODE_ENV) as Environment;

const config = {
  devTools: env !== 'production'
};

const defineStoreOptions = (options: Partial<ConfigureStoreOptions>) => {
  return Object.assign(config, options);
}

export {
  config,
  defineStoreOptions
}
