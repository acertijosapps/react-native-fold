import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type HostInstance, StyleSheet, View } from 'react-native';

import { useFold } from './useFold';

export type FoldBookPaneProps = {
    start: ReactNode;
    end: ReactNode;
    fallback: ReactNode;
};

type PaneFrame = {
    x: number;
    width: number;
};

const FoldBookPane = ({ start, end, fallback }: FoldBookPaneProps): React.JSX.Element => {
    const fold = useFold();
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
    const isSplit =
        fold != null &&
        frame != null &&
        fold.isSeparating &&
        fold.isHalfOpened &&
        fold.orientation === 'vertical' &&
        left > 0 &&
        left + fold.bounds.width < frame.width;

    return (
        <View
            ref={paneRef}
            style={isSplit ? styles.row : styles.container}
            onLayout={measure}
        >
            {isSplit ? (
                <>
                    <View style={{ width: left }}>{start}</View>
                    <View style={{ width: fold.bounds.width }} />
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
