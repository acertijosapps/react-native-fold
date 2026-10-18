# Changelog

Todas las notas relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/); versionado [SemVer](https://semver.org/lang/es/).

## [Sin liberar]

### Añadido
- `<FoldBookPane start end fallback />` para la postura libro (bisagra vertical): divide lado a lado y reserva `bounds.width` entre ambos paneles.
- API `FoldProvider`, `useFold()` y `<FoldPane primary secondary fallback />` sobre el contrato `FoldState`.
- Detección de plegado en Android con `FoldingFeature` vía `WindowInfoTrackerCallbackAdapter` (`androidx.window` 1.5.1); `bounds` convertidos a dp en Kotlin.
- Detección de plegado en iOS 27.1 con `UIHingeInteraction` y geometría de `UIViewReservedRegion` (`divisionRegionKind`): `bounds` con márgenes, `orientation` según la región e `isSeparating` según la región activa.
- Enforcement de versionado con git-hooks nativos en `.githooks/` (Conventional Commits y bloqueo de commits directos sobre `main`/`beta`).

### Cambiado
- `peerDependencies` exige `react-native` >= 0.80.0 y `react` >= 19.1.0 (mínimo para `CodegenTypes.EventEmitter`).
- Paquete publicado como `@acertijosapps/react-native-fold` (acceso público), con autor AcertijosApps y repositorio en GitLab.

### Corregido
- iOS implementa `invalidate`: al recargar JS retira la vista anfitriona y la interacción de bisagra en vez de acumularlas.
- `FoldPane` mide su posición en la ventana y alinea los paneles con la bisagra aunque no empiece en el borde superior.
- iOS compila con Xcode anterior a 27.1: el código de la bisagra se excluye y `useFold()` devuelve `null`.
- `FoldProvider` relee `getFoldState()` tras suscribirse para no perder el primer evento nativo.
- iOS emite solo cuando cambia el estado, no en cada cambio de ángulo de la bisagra.
- (example) Adopción de UIScene lifecycle para que la app corra en iOS 27.

### Eliminado

<!--
 Al promover beta → main, renombra la sección de arriba a la versión liberada:

## [X.Y.Z] - AAAA-MM-DD

 y vuelve a crear una sección [Sin liberar] vacía.
-->
