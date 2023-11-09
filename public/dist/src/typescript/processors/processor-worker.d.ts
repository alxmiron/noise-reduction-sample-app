import { EventDataMap } from "@vonage/media-processor";
import Emittery from "emittery";
import { NoiseSuppressionOptions } from "../interfaces";
/**
 * @internal
 */
export declare class ProcessorWorker extends Emittery<EventDataMap> {
    private transformer?;
    private processor;
    init(options?: NoiseSuppressionOptions): Promise<void>;
    transform(readable: ReadableStream<any>, writable: WritableStream<any>): void;
    setAudioOptions(echo_cancellation: boolean, auto_gain_control: boolean, noise_suppression: boolean, stereo_swapping: boolean, highpass_filter: boolean): void;
    enable(): void;
    disable(): void;
    terminate(): Promise<void>;
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
}
