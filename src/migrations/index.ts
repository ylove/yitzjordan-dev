import * as migration_20261022_230937_initial from './20261022_230937_initial';
import * as migration_20261023_014233_research_video_kind from './20261023_014233_research_video_kind';
import * as migration_20261023_015703_opportunity_briefs from './20261023_015703_opportunity_briefs';

export const migrations = [
  {
    up: migration_20261022_230937_initial.up,
    down: migration_20261022_230937_initial.down,
    name: '20261022_230937_initial',
  },
  {
    up: migration_20261023_014233_research_video_kind.up,
    down: migration_20261023_014233_research_video_kind.down,
    name: '20261023_014233_research_video_kind',
  },
  {
    up: migration_20261023_015703_opportunity_briefs.up,
    down: migration_20261023_015703_opportunity_briefs.down,
    name: '20261023_015703_opportunity_briefs'
  },
];
