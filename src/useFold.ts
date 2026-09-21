import { useContext } from 'react';

import { FoldContext } from './foldContext';
import type { FoldState } from './types';

export const useFold = (): FoldState => useContext(FoldContext);
