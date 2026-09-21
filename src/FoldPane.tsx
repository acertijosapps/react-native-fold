import { type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useFold } from './useFold';

export type FoldPaneProps = {
    primary: ReactNode;
    secondary: ReactNode;
    fallback: ReactNode;
};

const FoldPane = ({ primary, secondary, fallback }: FoldPaneProps): React.JSX.Element => {
    const fold = useFold();
    const { height: windowHeight } = useWindowDimensions();

    if (
        fold == null ||
        !fold.isSeparating ||
        !fold.isHalfOpened ||
        fold.orientation !== 'horizontal'
    ) {
        return <>{fallback}</>;
    }

    const { y, height } = fold.bounds;

    if (y <= 0 || y + height >= windowHeight) {
        return <>{fallback}</>;
    }

    return (
        <View style={styles.container}>
            <View style={{ height: y }}>{primary}</View>
            <View style={{ height }} />
            <View style={styles.fill}>{secondary}</View>
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
