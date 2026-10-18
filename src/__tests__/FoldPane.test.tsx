import { Text, View } from 'react-native';

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import FoldPane from '../FoldPane';
import type { FoldState } from '../types';
import { useFold } from '../useFold';

jest.mock('../useFold', () => ({ useFold: jest.fn() }));

type MeasureInWindow = (
    callback: (x: number, y: number, width: number, height: number) => void,
) => void;

const mockedUseFold = jest.mocked(useFold);

const mockPaneFrame = (y: number, height: number): void => {
    const { prototype } = View as unknown as { prototype: { measureInWindow: MeasureInWindow } };
    jest.spyOn(prototype, 'measureInWindow').mockImplementation((callback) => {
        callback(0, y, 669, height);
    });
};

const tabletop = (overrides: Partial<NonNullable<FoldState>> = {}): FoldState => ({
    isSeparating: true,
    isHalfOpened: true,
    orientation: 'horizontal',
    bounds: { x: 0, y: 456, width: 669, height: 40 },
    ...overrides,
});

const renderPane = () =>
    render(
        <FoldPane
            primary={<Text testID="primary">primary</Text>}
            secondary={<Text testID="secondary">secondary</Text>}
            fallback={<Text testID="fallback">fallback</Text>}
        />,
    );

afterEach(() => {
    jest.restoreAllMocks();
});

describe('FoldPane', () => {
    it('renders the fallback without a fold', async () => {
        mockedUseFold.mockReturnValue(null);
        mockPaneFrame(0, 951);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
        expect(screen.queryByTestId('primary')).toBeNull();
    });

    it('splits around the hinge relative to the pane position', async () => {
        mockedUseFold.mockReturnValue(tabletop());
        mockPaneFrame(100, 851);

        await renderPane();

        const primaryPanel = screen.getByTestId('primary').parent;
        const [, spacer] = primaryPanel?.parent?.children ?? [];

        expect(primaryPanel?.props.style).toEqual({ height: 356 });
        expect(typeof spacer === 'string' ? null : spacer?.props.style).toEqual({ height: 40 });
        expect(screen.getByTestId('secondary')).toBeTruthy();
        expect(screen.queryByTestId('fallback')).toBeNull();
    });

    it('falls back when the hinge is vertical', async () => {
        mockedUseFold.mockReturnValue(
            tabletop({
                orientation: 'vertical',
                bounds: { x: 455.5, y: 0, width: 40, height: 669 },
            }),
        );
        mockPaneFrame(0, 669);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the device is not half opened', async () => {
        mockedUseFold.mockReturnValue(tabletop({ isHalfOpened: false, isSeparating: false }));
        mockPaneFrame(100, 851);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the pane starts below the hinge', async () => {
        mockedUseFold.mockReturnValue(tabletop());
        mockPaneFrame(500, 451);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the hinge reaches the pane bottom edge', async () => {
        mockedUseFold.mockReturnValue(tabletop());
        mockPaneFrame(100, 380);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });
});
