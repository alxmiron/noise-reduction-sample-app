import { EventDataMap, MediaProcessorConnector } from "@vonage/media-processor";
import { NoiseSuppressionOptions } from "../interfaces";
import Emittery from "emittery";
/**
 * Dtln helper class
 */
export declare class VonageNoiseSuppression extends Emittery<EventDataMap> {
    private worker?;
    private connector?;
    /**
     * Initialize the transformer.
     * It is mandatory to call this function before using the NoiseSuppression
     * @param options Options used to initialize the transformer
     */
    init(options?: NoiseSuppressionOptions): Promise<void>;
    /**
     * MediaProcessorConnector getter
     * @returns connector
     */
    getConnector(): MediaProcessorConnector;
    /**
     * Delete the noise suppression
     */
    close(): Promise<void>;
    /**
     * Enable the noise reduction
     */
    enable(): Promise<void>;
    /**
     * Disable the noise reduction
     */
    disable(): Promise<void>;
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
}
