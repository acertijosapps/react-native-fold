import { Text, useWindowDimensions, View } from 'react-native';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import FoldBookPane, { type FoldBookPaneProps } from '../FoldBookPane';
import type { FoldState } from '../types';
import { useFold } from '../useFold';

jest.mock('../useFold', () => ({ useFold: jest.fn() }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(),
}));

type MeasureInWindow = (
    callback: (x: number, y: number, width: number, height: number) => void,
) => void;

const mockedUseFold = jest.mocked(useFold);
const mockedUseWindowDimensions = jest.mocked(useWindowDimensions);

const mockWindow = (width: number, height: number): void => {
    mockedUseWindowDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
};

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

const renderPane = (props: Partial<FoldBookPaneProps> = {}) =>
    render(
        <FoldBookPane
            start={<Text testID="start">start</Text>}
            end={<Text testID="end">end</Text>}
            fallback={<Text testID="fallback">fallback</Text>}
            {...props}
        />,
    );

beforeEach(() => {
    mockWindow(951, 669);
});

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

    it('splits around a separating hinge on a fully open device', async () => {
        mockedUseFold.mockReturnValue(book({ isHalfOpened: false }));
        mockPaneFrame(0, 951);

        await renderPane();

        expect(screen.getByTestId('start').parent?.props.style).toEqual({ width: 455.5 });
    });

    it('falls back on a fully open device when splitWhen is halfOpened', async () => {
        mockedUseFold.mockReturnValue(book({ isHalfOpened: false }));
        mockPaneFrame(0, 951);

        await renderPane({ splitWhen: 'halfOpened' });

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    it('falls back when the hinge reaches the pane end edge', async () => {
        mockedUseFold.mockReturnValue(book());
        mockPaneFrame(0, 480);

        await renderPane();

        expect(screen.getByTestId('fallback')).toBeTruthy();
    });

    describe('splitWhenWide', () => {
        it('splits in half on a wide window without a fold', async () => {
            mockedUseFold.mockReturnValue(null);
            mockWindow(1280, 800);
            mockPaneFrame(0, 1280);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('start').parent?.props.style).toEqual({ flex: 1 });
            expect(screen.getByTestId('end').parent?.props.style).toEqual({ flex: 1 });
            expect(screen.queryByTestId('fallback')).toBeNull();
        });

        it('splits in half over a flat non separating fold', async () => {
            mockedUseFold.mockReturnValue(book({ isHalfOpened: false, isSeparating: false }));
            mockWindow(900, 700);
            mockPaneFrame(0, 900);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('start').parent?.props.style).toEqual({ flex: 1 });
        });

        it('keeps the fallback without the prop', async () => {
            mockedUseFold.mockReturnValue(null);
            mockWindow(1280, 800);
            mockPaneFrame(0, 1280);

            await renderPane();

            expect(screen.getByTestId('fallback')).toBeTruthy();
        });

        it('keeps the fallback on a tablet in portrait', async () => {
            mockedUseFold.mockReturnValue(null);
            mockWindow(800, 1280);
            mockPaneFrame(0, 800);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('fallback')).toBeTruthy();
        });

        it('keeps the fallback on a phone in landscape', async () => {
            mockedUseFold.mockReturnValue(null);
            mockWindow(915, 412);
            mockPaneFrame(0, 915);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('fallback')).toBeTruthy();
        });

        it('keeps the fallback while a horizontal hinge separates', async () => {
            mockedUseFold.mockReturnValue(
                book({
                    orientation: 'horizontal',
                    bounds: { x: 0, y: 456, width: 1280, height: 40 },
                }),
            );
            mockWindow(1280, 951);
            mockPaneFrame(0, 1280);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('fallback')).toBeTruthy();
        });

        it('prefers the hinge split over the wide split', async () => {
            mockedUseFold.mockReturnValue(book());
            mockWindow(951, 669);
            mockPaneFrame(0, 951);

            await renderPane({ splitWhenWide: true });

            expect(screen.getByTestId('start').parent?.props.style).toEqual({ width: 455.5 });
        });
    });
});
