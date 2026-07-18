/**
 * Pick a legible text color (white or near-black) for a given solid background.
 * Uses relative luminance so dark/saturated accents (e.g. Confident Orange)
 * get white text while light accents (Brilliant Yellow, teal) get dark text.
 */
export function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance < 0.3 ? "#ffffff" : "#0b1220";
}
