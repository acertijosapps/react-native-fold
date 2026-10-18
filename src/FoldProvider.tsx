import { type ReactNode, useEffect, useState } from 'react';

import { FoldContext, toFoldState } from './foldContext';
import Fold from './NativeFold';
import type { FoldState } from './types';

export type FoldProviderProps = {
    children: ReactNode;
};

const FoldProvider = ({ children }: FoldProviderProps): React.JSX.Element => {
    const [state, setState] = useState<FoldState>(() => toFoldState(Fold.getFoldState()));

    useEffect(() => {
        const subscription = Fold.onFoldChange((event) => {
            setState(toFoldState(event));
        });
        setState(toFoldState(Fold.getFoldState()));

        return () => {
            subscription.remove();
        };
    }, []);

    return <FoldContext.Provider value={state}>{children}</FoldContext.Provider>;
};

export default FoldProvider;
