
import { SavedPpmp } from '../../types';
import { allPpmps } from './ppmps';

// The initial state for the consolidator is now populated with data from all office PPMP files.
// This allows the consolidator to be functional immediately upon opening.
export const initialSavedPpmps: SavedPpmp[] = allPpmps;
