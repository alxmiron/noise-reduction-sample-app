import { EventDataMap, MediaProcessorInterface } from "@vonage/media-processor";
import Emittery from "emittery";
import { NoiseSuppressionOptions } from "../interfaces";
/**
 * @internal
 */
export declare class ProcessorMain extends Emittery<EventDataMap> implements MediaProcessorInterface {
    private worker?;
    private isEnabled;
    init(options?: NoiseSuppressionOptions): Promise<void>;
    enable(): Promise<void>;
    disable(): Promise<void>;
    transform(readable: ReadableStream<any>, writable: WritableStream<any>): Promise<void>;
    destroy(): Promise<void>;
    setAudioOptions(echo_cancellation: boolean, auto_gain_control: boolean, noise_suppression: boolean, stereo_swapping: boolean, highpass_filter: boolean): Promise<void>;
    /**
     * Return the latency of the transformation
     * The latency will be computed only if the options debug flag is true
     * Otherwise, will return 0;
     * @returns latency
     */
    getLatency(): Promise<number>;
    /**
     * Return the latency of processing within the wasm in nanoseconds.
     * @returns latency
     */
    getWasmLatencyNs(): Promise<number>;
    private startWorker;
    /**
     * Delete the noise suppression
     */
    close(): Promise<void>;
}
