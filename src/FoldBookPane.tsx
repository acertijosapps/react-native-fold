import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type HostInstance, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { FoldSplitWhen } from './types';
import { useFold } from './useFold';

export type FoldBookPaneProps = {
    start: ReactNode;
    end: ReactNode;
    fallback: ReactNode;
    splitWhen?: FoldSplitWhen;
    splitWhenWide?: boolean;
};

const WIDE_MIN_WIDTH = 840;
const WIDE_MIN_HEIGHT = 480;

type PaneFrame = {
    x: number;
    width: number;
};

type PaneSplit = {
    start: number;
    spacer: number;
};

const FoldBookPane = ({
    start,
    end,
    fallback,
    splitWhen = 'separating',
    splitWhenWide = false,
}: FoldBookPaneProps): React.JSX.Element => {
    const fold = useFold();
    const windowSize = useWindowDimensions();
    const paneRef = useRef<HostInstance>(null);
    const [frame, setFrame] = useState<PaneFrame | null>(null);

    const measure = useCallback(() => {
        paneRef.current?.measureInWindow((x, _y, width) => {
            setFrame((current) =>
                current != null && current.x === x && current.width === width
                    ? current
                    : { x, width },
            );
        });
    }, []);

    useEffect(() => {
        measure();
    }, [fold, measure]);

    const left = fold != null && frame != null ? fold.bounds.x - frame.x : 0;
    const isFoldSplit =
        fold != null &&
        frame != null &&
        fold.isSeparating &&
        (splitWhen === 'separating' || fold.isHalfOpened) &&
        fold.orientation === 'vertical' &&
        left > 0 &&
        left + fold.bounds.width < frame.width;
    const isWideSplit =
        !isFoldSplit &&
        splitWhenWide &&
        frame != null &&
        (fold == null || !fold.isSeparating) &&
        windowSize.width >= WIDE_MIN_WIDTH &&
        windowSize.height >= WIDE_MIN_HEIGHT;

    let split: PaneSplit | null = null;
    if (isFoldSplit) {
        split = { start: left, spacer: fold.bounds.width };
    } else if (isWideSplit) {
        split = { start: frame.width / 2, spacer: 0 };
    }

    return (
        <View
            ref={paneRef}
            style={split != null ? styles.row : styles.container}
            onLayout={measure}
        >
            {split != null ? (
                <>
                    <View style={{ width: split.start }}>{start}</View>
                    <View style={{ width: split.spacer }} />
                    <View style={styles.fill}>{end}</View>
                </>
            ) : (
                fallback
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    fill: {
        flex: 1,
    },
});

export default FoldBookPane;
