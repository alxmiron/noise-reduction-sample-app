/// <reference types="dom-webcodecs" />
import Emittery from "emittery";
import { NoiseSuppressionOptions, TransformerEventDataMap } from "../interfaces";
/**
 * Dtln transformer.
 * Process audio stream in order to remove background noise.
 */
export declare class NoiseSuppressionTransformer extends Emittery<TransformerEventDataMap> {
    private isEnabled;
    private wasmInstance?;
    private wasmTransformer?;
    private internalResampleSupported?;
    private latency;
    /**
     * Transform function.
     * Will process audioData to remove noise
     */
    transform: (data: AudioData, controller: TransformStreamDefaultController) => Promise<void>;
    constructor();
    /**
     * Initialize the transformer.
     * It is mandatory to call this function before using the transformer
     * @param options Options used to initialize the transformer
     */
    init(options?: NoiseSuppressionOptions): Promise<void>;
    /**
     * @internal
     */
    getWav(): string;
    /**
     * Tell to the transformer what preprocessing are applied before reaching this transformer
     */
    setAudioOptions(echo_cancellation: boolean, auto_gain_control: boolean, noise_suppression: boolean, stereo_swapping: boolean, highpass_filter: boolean): void;
    /**
     * Enable the noise reduction
     */
    enable(): void;
    /**
     * Disable the noise reduction
     */
    disable(): void;
    /**
     * Return the latency of the transformation
     * The latency will be computed only if the options debug flag is true
     * Otherwise, will return 0;
     * @returns latency
     */
    getLatency(): number;
    /**
     * Return the latency of processing within the wasm in nanoseconds.
     * @returns latency
     */
    getWasmLatencyNs(): number;
    private transformDebug;
    private transformAudioData;
    private loadModel;
    private getAudioDataAsFloat32;
    private audioDataToTypedArray;
    private convertTypedArray;
    private isMonoThread;
}
