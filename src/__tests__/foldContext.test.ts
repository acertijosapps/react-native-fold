import { describe, expect, it } from '@jest/globals';

import { toFoldState } from '../foldContext';
import type { NativeFoldEvent } from '../NativeFold';

const nativeEvent = (overrides: Partial<NativeFoldEvent> = {}): NativeFoldEvent => ({
    isPresent: true,
    isSeparating: true,
    isHalfOpened: true,
    orientation: 'horizontal',
    x: 0,
    y: 426,
    width: 883,
    height: 0,
    ...overrides,
});

describe('toFoldState', () => {
    it('returns null when no fold is present', () => {
        expect(toFoldState(nativeEvent({ isPresent: false }))).toBeNull();
    });

    it('maps the native event to the fold state', () => {
        const state = toFoldState(
            nativeEvent({
                isHalfOpened: false,
                orientation: 'vertical',
                x: 455.5,
                y: 0,
                width: 40,
                height: 669,
            }),
        );

        expect(state).toEqual({
            isSeparating: true,
            isHalfOpened: false,
            orientation: 'vertical',
            bounds: { x: 455.5, y: 0, width: 40, height: 669 },
        });
    });
});
