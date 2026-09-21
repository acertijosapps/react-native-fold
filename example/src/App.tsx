import { StyleSheet, Text, View } from 'react-native';

import { FoldPane, FoldProvider, useFold } from 'react-native-fold';

const StateReadout = (): React.JSX.Element => {
    const fold = useFold();

    return (
        <View style={styles.readout}>
            <Text style={styles.mono}>{JSON.stringify(fold, null, 2)}</Text>
        </View>
    );
};

const App = (): React.JSX.Element => {
    return (
        <FoldProvider>
            <FoldPane
                primary={
                    <View style={[styles.pane, styles.primary]}>
                        <Text style={styles.label}>Primary</Text>
                        <StateReadout />
                    </View>
                }
                secondary={
                    <View style={[styles.pane, styles.secondary]}>
                        <Text style={styles.label}>Secondary</Text>
                    </View>
                }
                fallback={
                    <View style={[styles.pane, styles.fallback]}>
                        <Text style={styles.label}>Fallback</Text>
                        <StateReadout />
                    </View>
                }
            />
        </FoldProvider>
    );
};

const styles = StyleSheet.create({
    pane: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    primary: {
        backgroundColor: '#dbeafe',
    },
    secondary: {
        backgroundColor: '#dcfce7',
    },
    fallback: {
        backgroundColor: '#f1f5f9',
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    readout: {
        paddingHorizontal: 12,
    },
    mono: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});

export default App;
