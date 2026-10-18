# @acertijosapps/react-native-fold

Foldable detection (tabletop/book) for React Native. Android reads folding posture
from `androidx.window`; iOS reads hinge state from `UIHingeInteraction` (iOS 27.1+).

> [!WARNING]
> iOS detection requires building your app with **Xcode 27.1 or later** (iOS 27.1 SDK).
> With an older Xcode the library still compiles, but the hinge APIs are left out and
> `useFold()` is always `null` on iOS, even on an iPhone Duo.

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
import { FoldProvider, FoldPane, useFold } from '@acertijosapps/react-native-fold';

function App() {
  return (
    <FoldProvider>
      <FoldPane
        primary={<Top />}
        secondary={<Bottom />}
        fallback={<Single />}
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

`FoldPane` splits only when `isSeparating && isHalfOpened && orientation === 'horizontal'`,
and falls back when the hinge is not strictly inside the pane. It measures its own position
in the window, so panels line up with the hinge even below a header; the spacer takes the
hinge height and it never splits 50/50.

## Platform support

- Android: `WindowInfoTrackerCallbackAdapter` + `FoldingFeature` (`androidx.window` 1.5.1).
- iOS 27.1+: `UIHingeInteraction` for the hinge status plus `UIViewReservedRegion`
  (`divisionRegionKind`) for the geometry. `bounds` is the division region frame, including
  the margins iOS reserves around the fold for interactive content. `orientation` comes from
  the region's aspect, `isSeparating` from the region being active and `isHalfOpened` from
  `PartiallyOpen`. On the cover display there is no division region and `useFold()` is `null`;
  below iOS 27.1 it is always `null`.

## License

MIT
