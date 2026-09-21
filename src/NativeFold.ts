import { type CodegenTypes, type TurboModule, TurboModuleRegistry } from 'react-native';

export type NativeFoldEvent = {
    isPresent: boolean;
    isSeparating: boolean;
    isHalfOpened: boolean;
    orientation: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface Spec extends TurboModule {
    getFoldState(): NativeFoldEvent;
    readonly onFoldChange: CodegenTypes.EventEmitter<NativeFoldEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Fold');
