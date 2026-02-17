export function getCarImageUrl(merk: string, model: string, year: number): string {
  // Ensure this is a simple, deterministic transformation
  const cleanMerk = encodeURIComponent(merk);
  const cleanModel = encodeURIComponent(model);
  
  // Return a static URL pattern
  return `https://placehold.co/600x400/3b82f6/white?text=${cleanMerk}+${cleanModel}`;
  
}