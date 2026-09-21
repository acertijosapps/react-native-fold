# react-native-fold

Foldable detection (tabletop/flex) for React Native. Android reads folding posture
from `androidx.window`; iOS reads hinge state from `UIHingeInteraction` (iOS 27.1+).

## Installation

```sh
npm install react-native-fold
```

## Usage

```tsx
import { FoldProvider, FoldPane, useFold } from 'react-native-fold';

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

`bounds` is always in dp; the density division happens in Kotlin.

`FoldPane` splits only when `isSeparating && isHalfOpened && orientation === 'horizontal'`,
and falls back when the hinge touches a window edge. Panels are laid out around the
hinge bounds with a spacer of the hinge height; it never splits 50/50.

## Platform support

- Android: `WindowInfoTrackerCallbackAdapter` + `FoldingFeature` (`androidx.window` 1.5.1).
- iOS 27.1+: `UIHingeInteraction` on the key window. `UIHinge` exposes only `status`
  (`Closed`/`PartiallyOpen`/`FullyOpen`) and `angle`, so `isSeparating`/`isHalfOpened`
  map from `PartiallyOpen`, `orientation` is reported as `'vertical'` (iPhone Duo hinge),
  and `bounds` is zero (iOS provides no hinge geometry). Below iOS 27.1, `useFold()` is `null`.
  Because the hinge is vertical, `FoldPane` does not split on iOS; read `useFold()` directly.

## License

MIT
