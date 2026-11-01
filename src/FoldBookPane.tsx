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
        (fold == null || !fold.isSeparating) &&
        windowSize.width >= WIDE_MIN_WIDTH &&
        windowSize.height >= WIDE_MIN_HEIGHT;

    let content: ReactNode = fallback;
    if (isFoldSplit) {
        content = (
            <>
                <View style={{ width: left }}>{start}</View>
                <View style={{ width: fold.bounds.width }} />
                <View style={styles.fill}>{end}</View>
            </>
        );
    } else if (isWideSplit) {
        content = (
            <>
                <View style={styles.fill}>{start}</View>
                <View style={styles.fill}>{end}</View>
            </>
        );
    }

    return (
        <View
            ref={paneRef}
            style={isFoldSplit || isWideSplit ? styles.row : styles.container}
            onLayout={measure}
        >
            {content}
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
