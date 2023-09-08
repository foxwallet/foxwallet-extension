/**
 * Convert px to rem.
 * @param {number} pxValue - The pixel value to be converted.
 * @param {number} [baseSize=16] - The base size for the conversion. Typically, browsers default to 16px for 1rem.
 * @returns {string} The value in rem.
 */
export function pxToRem(pxValue: number, baseSize: number = 16): string {
  return `${pxValue / baseSize}rem`;
}
