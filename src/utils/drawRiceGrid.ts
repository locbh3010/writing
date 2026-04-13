/**
 * Draws a "Mễ tự cách" (Rice Grid / 米字格) background on a canvas context.
 * This consists of:
 *   - A solid outer border
 *   - Dashed horizontal and vertical center lines ('+' cross)
 *   - Dashed diagonal lines ('X' cross)
 */
export function drawRiceGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const padding = 1;
  const left = padding;
  const top = padding;
  const right = width - padding;
  const bottom = height - padding;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Outer solid border
  ctx.strokeStyle = "#c4b5a0";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(left, top, right - left, bottom - top);

  // Dashed guide lines
  ctx.strokeStyle = "#d4c5b0";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);

  // Vertical center line
  ctx.beginPath();
  ctx.moveTo(centerX, top);
  ctx.lineTo(centerX, bottom);
  ctx.stroke();

  // Horizontal center line
  ctx.beginPath();
  ctx.moveTo(left, centerY);
  ctx.lineTo(right, centerY);
  ctx.stroke();

  // Diagonal: top-left to bottom-right
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // Diagonal: top-right to bottom-left
  ctx.beginPath();
  ctx.moveTo(right, top);
  ctx.lineTo(left, bottom);
  ctx.stroke();

  ctx.restore();
}
