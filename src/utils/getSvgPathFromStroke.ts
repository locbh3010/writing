/**
 * Converts the output of perfect-freehand's getStroke() into an SVG path string.
 * This is the recommended approach from the perfect-freehand docs.
 */
export function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) return "";

  const d: string[] = [];
  const [first, ...rest] = points;

  d.push(`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`);

  for (let i = 0; i < rest.length; i++) {
    const [x, y] = rest[i];

    if (i === 0) {
      d.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      const prev = rest[i - 1];
      const cpX = ((prev[0] + x) / 2).toFixed(2);
      const cpY = ((prev[1] + y) / 2).toFixed(2);
      d.push(`Q ${prev[0].toFixed(2)} ${prev[1].toFixed(2)} ${cpX} ${cpY}`);
    }
  }

  d.push("Z");
  return d.join(" ");
}
