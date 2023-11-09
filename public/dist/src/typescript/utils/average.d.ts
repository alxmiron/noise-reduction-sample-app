/**
 * @internal
 */
export declare class Average {
    private size;
    private values;
    private sum;
    constructor(size: number);
    push(value: number): void;
    value(): number;
}
