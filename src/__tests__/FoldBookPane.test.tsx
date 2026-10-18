import { Text, View } from 'react-native';

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import FoldBookPane from '../FoldBookPane';
import type { FoldState } from '../types';
import { useFold } from '../useFold';

jest.mock('../useFold', () => ({ useFold: jest.fn() }));

type MeasureInWindow = (
    callback: (x: number, y: number, width: number, height: number) => void,
) => void;

const mockedUseFold = jest.mocked(useFold);

const mockPaneFrame = (x: number, width: number): void => {
    const { prototype } = View as unknown as { prototype: { measureInWindow: MeasureInWindow } };
    jest.spyOn(prototype, 'measureInWindow').mockImplementation((callback) => {
        callback(x, 0, width, 669);
    });
};

const book = (overrides: Partial<NonNullable<FoldState>> = {}): FoldState => ({
    isSeparating: true,
    isHalfOpened: true,
    orientation: 'vertical',
    bounds: { x: 455.5, y: 0, width: 40, height: 669 },
    ...overrides,
});

const renderPane = () =>
    render(
        <FoldBookPane
            start={<Text testID="start">start</Text>}
            end={<Text testID="end">end</Text>}
            fallback={<Text testID="fallback">fallback</Text>}
        />,
    );

afterEach(() => {
    jest.restoreAllMocks();
});

describe('FoldBookPane', () => {
    it('renders the fallback without a fold', async () => {
        mockedUseFold.mockReturnValue(null);
        mockPaneFrame(0, 951);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
        expect(screen.queryByTestId('start')).toBeNull();
    });

    it('splits side by side reserving the hinge width', async () => {
        mockedUseFold.mockReturnValue(book());
        mockPaneFrame(0, 951);

        await renderPane();

        const startPanel = screen.getByTestId('start').parent;
        const [, spacer] = startPanel?.parent?.children ?? [];

        expect(startPanel?.props.style).toEqual({ width: 455.5 });
        expect(typeof spacer === 'string' ? null : spacer?.props.style).toEqual({ width: 40 });
        expect(screen.getByTestId('end')).toBeTruthy();
        expect(screen.queryByTestId('fallback')).toBeNull();
    });

    it('subtracts the pane x offset in the window', async () => {
        mockedUseFold.mockReturnValue(book());
        mockPaneFrame(100, 851);

        await renderPane();

        expect(screen.getByTestId('start').parent?.props.style).toEqual({ width: 355.5 });
    });

    it('falls back when the hinge is horizontal', async () => {
        mockedUseFold.mockReturnValue(
            book({
                orientation: 'horizontal',
                bounds: { x: 0, y: 456, width: 669, height: 40 },
            }),
        );
        mockPaneFrame(0, 669);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the device is fully open', async () => {
        mockedUseFold.mockReturnValue(book({ isHalfOpened: false, isSeparating: false }));
        mockPaneFrame(0, 951);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the hinge reaches the pane end edge', async () => {
        mockedUseFold.mockReturnValue(book());
        mockPaneFrame(0, 480);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });
});
