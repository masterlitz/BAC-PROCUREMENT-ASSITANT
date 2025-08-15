

import { SavedPpmp } from '../../types';
import { allPpmps } from './ppmps';

// The initial state for the consolidator, now pre-populated with all available data.
// The previous mapping logic was a remnant from a refactor and caused a type error.
// Assuming all entries in `allPpmps` are now valid `SavedPpmp` objects or arrays of them.
export const initialSavedPpmps: SavedPpmp[] = allPpmps.flat();
