/// <reference types="dom-webcodecs" />
import { NoiseSuppressionOptions } from "../interfaces";
/**
 * @internal
 */
export declare class WavExporterTransformer {
    private wasmInstance?;
    private wasmTransformer?;
    init(options?: NoiseSuppressionOptions): Promise<void>;
    transform(data: AudioData, controller: TransformStreamDefaultController): void;
    getWav(): string;
    private getAudioDataAsInt16;
    private getAudioDataAsFloat32;
    private audioDataToTypedArray;
}
