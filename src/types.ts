export type FoldOrientation = 'horizontal' | 'vertical';

export type FoldSplitWhen = 'separating' | 'halfOpened';

export type FoldState = {
    isSeparating: boolean;
    isHalfOpened: boolean;
    orientation: FoldOrientation;
    bounds: { x: number; y: number; width: number; height: number };
} | null;
