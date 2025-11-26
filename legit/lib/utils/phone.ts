export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it starts with 82 (Korea country code)
  if (digits.startsWith('82')) {
    // Replace 82 with 0
    return '0' + digits.slice(2);
  }
  
  // If it's a local mobile number without country code (e.g., 1012345678), add 0
  if (digits.length === 10 && digits.startsWith('10')) {
    return '0' + digits;
  }

  return digits;
}

