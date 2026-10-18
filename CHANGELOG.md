# Changelog

Todas las notas relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/); versionado [SemVer](https://semver.org/lang/es/).

## [Sin liberar]

### Añadido
- API `FoldProvider`, `useFold()` y `<FoldPane primary secondary fallback />` sobre el contrato `FoldState`.
- Detección de plegado en Android con `FoldingFeature` vía `WindowInfoTrackerCallbackAdapter` (`androidx.window` 1.5.1); `bounds` convertidos a dp en Kotlin.
- Detección de plegado en iOS 27.1 con `UIHingeInteraction` y geometría de `UIViewReservedRegion` (`divisionRegionKind`): `bounds` con márgenes, `orientation` según la región e `isSeparating` según la región activa.
- Enforcement de versionado con git-hooks nativos en `.githooks/` (Conventional Commits y bloqueo de commits directos sobre `main`/`beta`).

### Cambiado

### Corregido
- `FoldProvider` relee `getFoldState()` tras suscribirse para no perder el primer evento nativo.
- iOS emite solo cuando cambia el estado, no en cada cambio de ángulo de la bisagra.
- (example) Adopción de UIScene lifecycle para que la app corra en iOS 27.

### Eliminado

<!--
 Al promover beta → main, renombra la sección de arriba a la versión liberada:

## [X.Y.Z] - AAAA-MM-DD

 y vuelve a crear una sección [Sin liberar] vacía.
-->
