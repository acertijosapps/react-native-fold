import { createContext } from 'react';

import type { NativeFoldEvent } from './NativeFold';
import type { FoldOrientation, FoldState } from './types';

export const FoldContext = createContext<FoldState>(null);

export const toFoldState = (event: NativeFoldEvent): FoldState => {
    if (!event.isPresent) {
        return null;
    }

    return {
        isSeparating: event.isSeparating,
        isHalfOpened: event.isHalfOpened,
        orientation: event.orientation as FoldOrientation,
        bounds: {
            x: event.x,
            y: event.y,
            width: event.width,
            height: event.height,
        },
    };
};
