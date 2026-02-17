export function getCarImageUrl(merk: string, model: string, year: number): string {
  // Clean up the strings for URL
  const cleanMerk = encodeURIComponent(merk);
  const cleanModel = encodeURIComponent(model);
  
  // Use a reliable placeholder service with car icon
  // This will show a colored box with the car make and model
  return `https://placehold.co/600x400/3b82f6/white?text=${cleanMerk}+${cleanModel}`;
  
  // Alternative: Use a car emoji and text
  // return `https://placehold.co/600x400/3b82f6/white?text=${encodeURIComponent('🚗')}+${cleanMerk}+${cleanModel}`;
}