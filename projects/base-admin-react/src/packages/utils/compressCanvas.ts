export function compressCanvas(canvas: HTMLCanvasElement, maxWidth: number, maxHeight: number) {
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  // 计算缩放比例（保持宽高比）
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = height * ratio;
  }

  if (height > maxHeight) {
    const ratio = maxHeight / height;
    height = maxHeight;
    width = width * ratio;
  }

  // 创建新canvas并绘制缩放后的图像
  const newCanvas = document.createElement('canvas');
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext('2d')!;

  // 缩放绘制
  newCtx.drawImage(
    canvas, 0, 0, originalWidth, originalHeight,
    0, 0, width, height
  );

  // 生成压缩后的URL（可选：同时降低质量）
  return newCanvas.toDataURL('image/jpeg', 0.7); // 同时使用质量参数
}
