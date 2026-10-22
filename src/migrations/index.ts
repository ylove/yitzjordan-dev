import * as migration_20261022_230937_initial from './20261022_230937_initial';

export const migrations = [
  {
    up: migration_20261022_230937_initial.up,
    down: migration_20261022_230937_initial.down,
    name: '20261022_230937_initial'
  },
];
