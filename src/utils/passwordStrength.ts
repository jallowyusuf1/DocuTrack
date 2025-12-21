export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  color: string;
  message: string;
}

/**
 * Validates 8-character password strength (numbers or letters)
 * Returns: weak (red), medium (yellow), or strong (green)
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      strength: 'weak',
      color: '#EF4444',
      message: 'Enter password',
    };
  }

  if (password.length < 8) {
    return {
      strength: 'weak',
      color: '#EF4444',
      message: 'Password must be 8 characters',
    };
  }

  if (password.length > 8) {
    return {
      strength: 'weak',
      color: '#EF4444',
      message: 'Password must be exactly 8 characters',
    };
  }

  // Allow alphanumeric (numbers and letters)
  if (!/^[A-Za-z0-9]{8}$/.test(password)) {
    return {
      strength: 'weak',
      color: '#EF4444',
      message: 'Password must be 8 characters (letters or numbers)',
    };
  }

  // Check for patterns that make password weak
  const isAllSame = /^(.)\1{7}$/.test(password);
  const isSequential = /01234567|12345678|23456789|98765432|87654321|76543210|abcdefgh|bcdefghi|hgfedcba|ABCDEFGH|HGFEDCBA/i.test(password);
  const isRepeating = /(.)\1{2,}/.test(password);

  if (isAllSame || isSequential || isRepeating) {
    return {
      strength: 'weak',
      color: '#EF4444',
      message: 'Weak: Avoid patterns',
    };
  }

  // Check character variety
  const hasNumbers = /[0-9]/.test(password);
  const hasLetters = /[A-Za-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const uniqueChars = new Set(password.split('')).size;

  // Strong: Has both numbers and letters, mixed case, good variety
  if (hasNumbers && hasLetters && hasUpperCase && hasLowerCase && uniqueChars >= 6) {
    return {
      strength: 'strong',
      color: '#10B981',
      message: 'Strong password',
    };
  }

  // Medium: Has numbers and letters OR good variety
  if ((hasNumbers && hasLetters) || uniqueChars >= 5) {
    return {
      strength: 'medium',
      color: '#EAB308',
      message: 'Medium strength',
    };
  }

  return {
    strength: 'weak',
    color: '#EF4444',
    message: 'Weak: Add variety',
  };
}
