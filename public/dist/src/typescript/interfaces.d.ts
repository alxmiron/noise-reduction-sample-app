import { EventDataMap as MediaProcessorEventDataMap } from "@vonage/media-processor";
/**
 * Emittable events from the transformer
 */
export interface TransformerEventDataMap {
    warning: string;
}
/**
 * Emittable events from the VonageNoiseSuppression
 */
export interface ProcessorEventDataMap extends MediaProcessorEventDataMap, TransformerEventDataMap {
}
/**
 * Noise suppression options
 */
export interface NoiseSuppressionOptions {
    /**
     * Url of the folder containing all the required assets
     */
    assetsDirBaseUrl?: string;
    /**
     * Disable wasm multithreading
     */
    disableWasmMultiThread?: boolean;
    /**
     * Enable/disable  debug mode.
     * In debug mode, the transformer will :
     *  - compute latency.
     */
    debug?: boolean;
}
/**
 * @internal
 */
export interface WasmDtlnTransformer {
    init: (numOfThreads: number) => number;
    runAlgorithm: (samplesPerChannel: number, sample_rate_hz: number, number_of_channels: number) => number;
    setAudioOptions: (echo_cancellation: boolean, auto_gain_control: boolean, noise_suppression: boolean, stereo_swapping: boolean, highpass_filter: boolean) => void;
    getInputFrame: (size: number) => Int16Array;
    getOutputFrame: () => Int16Array;
    getModel1: (size: number) => Uint8Array;
    getModel2: (size: number) => Uint8Array;
    getNumberOfChannels: () => number;
    getSampleRate: () => number;
    getLatencyNs: () => number;
    getInternalResampleSupported: () => boolean;
}
