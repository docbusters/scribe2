export function truncateString(text: string, maxLength: number = 45): string {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}
