import { Text } from 'react-native';

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen } from '@testing-library/react-native';

import FoldProvider from '../FoldProvider';
import Fold, { type NativeFoldEvent } from '../NativeFold';
import { useFold } from '../useFold';

jest.mock('../NativeFold', () => ({
    __esModule: true,
    default: { getFoldState: jest.fn(), onFoldChange: jest.fn() },
}));

const mockedFold = jest.mocked(Fold);

const absent: NativeFoldEvent = {
    isPresent: false,
    isSeparating: false,
    isHalfOpened: false,
    orientation: 'vertical',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

const book: NativeFoldEvent = {
    isPresent: true,
    isSeparating: true,
    isHalfOpened: true,
    orientation: 'vertical',
    x: 455.5,
    y: 0,
    width: 40,
    height: 669,
};

const FoldProbe = (): React.JSX.Element => {
    const fold = useFold();

    return <Text>{fold == null ? 'none' : `${fold.orientation} ${fold.bounds.x}`}</Text>;
};

const renderProvider = () =>
    render(
        <FoldProvider>
            <FoldProbe />
        </FoldProvider>,
    );

afterEach(() => {
    jest.resetAllMocks();
});

describe('FoldProvider', () => {
    it('picks up a state emitted before it subscribed', async () => {
        mockedFold.getFoldState.mockReturnValueOnce(absent).mockReturnValue(book);
        mockedFold.onFoldChange.mockReturnValue({ remove: jest.fn() });

        await renderProvider();

        expect(screen.getByText('vertical 455.5')).toBeTruthy();
    });

    it('updates on native events and unsubscribes on unmount', async () => {
        const remove = jest.fn();
        let emit: ((event: NativeFoldEvent) => void) | undefined;
        mockedFold.getFoldState.mockReturnValue(absent);
        mockedFold.onFoldChange.mockImplementation((handler) => {
            emit = (event) => {
                handler(event);
            };
            return { remove };
        });

        const { unmount } = await renderProvider();
        expect(screen.getByText('none')).toBeTruthy();

        await act(async () => {
            emit?.(book);
        });
        expect(screen.getByText('vertical 455.5')).toBeTruthy();

        await unmount();
        expect(remove).toHaveBeenCalledTimes(1);
    });
});
