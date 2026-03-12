export function getCarImageUrl(merk: string, model: string, year: number): string {
  const cleanMerk = encodeURIComponent(merk);
  const cleanModel = encodeURIComponent(model);
  
  return `https://placehold.co/600x400/3b82f6/white?text=${cleanMerk}+${cleanModel}`;
  
}