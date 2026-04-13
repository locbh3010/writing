/**
 * A single point captured during drawing: [x, y, pressure]
 */
export type Point = number[];

/**
 * A stroke is an array of points.
 */
export type Stroke = Point[];

/**
 * The full drawing data is an array of strokes.
 */
export type StrokesData = Stroke[];
