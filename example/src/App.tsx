import { FoldProvider } from '@acertijosapps/react-native-fold';

import InboxScreen from './InboxScreen';

const App = (): React.JSX.Element => {
    return (
        <FoldProvider>
            <InboxScreen />
        </FoldProvider>
    );
};

export default App;
