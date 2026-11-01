# @acertijosapps/react-native-fold

Foldable detection (tabletop/book) for React Native. Android reads folding posture
from `androidx.window`; iOS reads hinge state from `UIHingeInteraction` (iOS 27.1+).

> [!WARNING]
> iOS detection requires building your app with **Xcode 27.1 or later** (iOS 27.1 SDK).
> With an older Xcode the library still compiles, but the hinge APIs are left out and
> `useFold()` is always `null` on iOS, even on an iPhone Duo.

## Screenshots

The example app on a half-opened device. The dark bar prints what `useFold()` returns.

| | Book posture · `FoldBookPane` | Tabletop posture · `FoldPane` |
|---|---|---|
| **iOS** · iPhone Duo | <img src="https://unpkg.com/@acertijosapps/react-native-fold/media/ios-book.png" width="360" alt="iPhone Duo half-opened with a vertical hinge: list and detail side by side with the 40 pt hinge region reserved" /> | <img src="https://unpkg.com/@acertijosapps/react-native-fold/media/ios-tabletop.png" width="260" alt="iPhone Duo half-opened and rotated: list above and detail below the hinge" /> |
| **Android** · Pixel 10 Pro Fold | <img src="https://unpkg.com/@acertijosapps/react-native-fold/media/android-book.png" width="320" alt="Pixel Fold half-opened with a vertical hinge: list and detail side by side at the fold line" /> | <img src="https://unpkg.com/@acertijosapps/react-native-fold/media/android-tabletop.png" width="320" alt="Pixel Fold in tabletop posture: list above and detail below the hinge" /> |

## Requirements

- React Native **0.80 or later** with the New Architecture (this is a Turbo Module).
- React 19.1 or later.

## Installation

```sh
yarn add @acertijosapps/react-native-fold
```

or with npm:

```sh
npm install @acertijosapps/react-native-fold
```

## Usage

```tsx
import { FoldBookPane, FoldPane, FoldProvider } from '@acertijosapps/react-native-fold';

function App() {
  return (
    <FoldProvider>
      <FoldBookPane
        start={<Left />}
        end={<Right />}
        fallback={
          <FoldPane
            primary={<Top />}
            secondary={<Bottom />}
            fallback={<Single />}
          />
        }
      />
    </FoldProvider>
  );
}
```

`useFold()` returns:

```ts
type FoldState = {
  isSeparating: boolean;
  isHalfOpened: boolean;
  orientation: 'horizontal' | 'vertical';
  bounds: { x: number; y: number; width: number; height: number };
} | null;
```

`bounds` is always in dp: Android divides by density in Kotlin; iOS points are already
density-independent.

`FoldPane` splits only when `isSeparating && orientation === 'horizontal'`, and falls back when the hinge is not strictly inside the pane. It measures its own position
in the window, so panels line up with the hinge even below a header; the spacer takes the
hinge height and it never splits 50/50.

`FoldBookPane` is the book-posture counterpart: it splits `start` | `end` side by side only
when `isSeparating && orientation === 'vertical'`, measures its own x offset
in the window and reserves `bounds.width` between both panels (the fold plus its margins on
iOS, the fold line on Android). Nest `FoldPane` as its `fallback` to cover both postures.

Both take `splitWhen` (`FoldSplitWhen`):

- `'separating'` (default) splits whenever the hinge separates the content: half opened, or a
  fully open device whose hinge still divides the screen (dual-screen devices). On
  single-screen Android foldables `isSeparating` is only true when half opened.
- `'halfOpened'` also requires `isHalfOpened`, the 1.0 behavior.

### Tablets and wide windows

`FoldBookPane` takes `splitWhenWide` (default `false`). When there is no separating hinge and
the window is at least **840 × 480 dp** (Material's expanded width, without a compact height),
it splits `start` | `end` 50/50 with no spacer:

```tsx
<FoldBookPane splitWhenWide start={<List />} end={<Detail />} fallback={<List />} />
```

- Tablets split in landscape and keep `fallback` in portrait; phones in landscape stay single
  pane because their height is compact.
- It reads the window (`useWindowDimensions`), so iPad Split View, Stage Manager and Android
  multi-window resize it correctly; a flat foldable's inner display counts as a small tablet.
- A real hinge always wins: a separating vertical hinge splits at the hinge, and a separating
  horizontal one keeps `fallback` so a nested `FoldPane` can take the tabletop posture.
- `useFold()` is not affected: it still reports only physical hinges.

## Platform support

- Android: `WindowInfoTrackerCallbackAdapter` + `FoldingFeature` (`androidx.window` 1.5.1).
- iOS 27.1+: `UIHingeInteraction` for the hinge status plus `UIViewReservedRegion`
  (`divisionRegionKind`) for the geometry. `bounds` is the division region frame, including
  the margins iOS reserves around the fold for interactive content. `orientation` comes from
  the region's aspect, `isSeparating` from the region being active and `isHalfOpened` from
  `PartiallyOpen`. On the cover display there is no division region and `useFold()` is `null`;
  below iOS 27.1 it is always `null`.

## Author

Made by [AcertijosApps](https://acertijosapps.com/librerias). See the rest of our libraries at
[acertijosapps.com/librerias](https://acertijosapps.com/librerias).

Questions or proposals: [acertijos.contacto@gmail.com](mailto:acertijos.contacto@gmail.com) or open an
[issue](https://github.com/acertijosapps/react-native-fold/issues).

## License

MIT
