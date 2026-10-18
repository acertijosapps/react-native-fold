import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type HostInstance, StyleSheet, View } from 'react-native';

import { useFold } from './useFold';

export type FoldPaneProps = {
    primary: ReactNode;
    secondary: ReactNode;
    fallback: ReactNode;
};

type PaneFrame = {
    y: number;
    height: number;
};

const FoldPane = ({ primary, secondary, fallback }: FoldPaneProps): React.JSX.Element => {
    const fold = useFold();
    const paneRef = useRef<HostInstance>(null);
    const [frame, setFrame] = useState<PaneFrame | null>(null);

    const measure = useCallback(() => {
        paneRef.current?.measureInWindow((_x, y, _width, height) => {
            setFrame((current) =>
                current != null && current.y === y && current.height === height
                    ? current
                    : { y, height },
            );
        });
    }, []);

    useEffect(() => {
        measure();
    }, [fold, measure]);

    const top = fold != null && frame != null ? fold.bounds.y - frame.y : 0;
    const isSplit =
        fold != null &&
        frame != null &&
        fold.isSeparating &&
        fold.isHalfOpened &&
        fold.orientation === 'horizontal' &&
        top > 0 &&
        top + fold.bounds.height < frame.height;

    return (
        <View
            ref={paneRef}
            style={styles.container}
            onLayout={measure}
        >
            {isSplit ? (
                <>
                    <View style={{ height: top }}>{primary}</View>
                    <View style={{ height: fold.bounds.height }} />
                    <View style={styles.fill}>{secondary}</View>
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
    fill: {
        flex: 1,
    },
});

export default FoldPane;
