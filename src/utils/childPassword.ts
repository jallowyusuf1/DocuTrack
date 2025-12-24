export type ChildPasswordStrength =
  | 'weak'
  | 'fair'
  | 'good'
  | 'strong'
  | 'excellent';

export interface ChildPasswordStrengthResult {
  strength: ChildPasswordStrength;
  score: number; // 0-100
  color: string;
  label: string;
  requirementsMet: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const SPECIAL = /[^A-Za-z0-9]/;

export function checkChildPasswordRequirements(password: string) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = SPECIAL.test(password);
  return { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
}

export function scoreChildPassword(password: string): ChildPasswordStrengthResult {
  const req = checkChildPasswordRequirements(password);

  // Score components
  const lengthScore = Math.min(40, Math.max(0, (password.length - 7) * 5)); // 8 chars => 5, 16 => 45 capped to 40
  const varietyScore =
    (req.hasUppercase ? 15 : 0) +
    (req.hasLowercase ? 15 : 0) +
    (req.hasNumber ? 15 : 0) +
    (req.hasSpecial ? 15 : 0);

  const uniqueChars = new Set(password.split('')).size;
  const entropyBonus = Math.min(15, Math.max(0, (uniqueChars - 6) * 3));

  let score = Math.min(100, lengthScore + varietyScore + entropyBonus);

  // Penalize common weak patterns
  const isAllSame = password.length > 0 && /^(.)\1+$/.test(password);
  const hasLongRepeat = /(.)\1{2,}/.test(password);
  const isSequential =
    /0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/i.test(
      password
    );
  if (isAllSame) score = Math.max(0, score - 35);
  if (hasLongRepeat) score = Math.max(0, score - 15);
  if (isSequential) score = Math.max(0, score - 20);

  const allCore = req.minLength && req.hasUppercase && req.hasLowercase && req.hasNumber && req.hasSpecial;

  let strength: ChildPasswordStrength = 'weak';
  let color = '#EF4444';
  let label = 'Weak';

  if (score >= 85 && allCore) {
    strength = 'excellent';
    color = '#10B981';
    label = 'Excellent';
  } else if (score >= 70 && allCore) {
    strength = 'strong';
    color = '#22C55E';
    label = 'Strong';
  } else if (score >= 55) {
    strength = 'good';
    color = '#84CC16';
    label = 'Good';
  } else if (score >= 40) {
    strength = 'fair';
    color = '#EAB308';
    label = 'Fair';
  }

  // If missing minimum requirements, cap label at Fair
  if (!req.minLength || !req.hasLowercase || !req.hasUppercase || !req.hasNumber || !req.hasSpecial) {
    if (strength === 'excellent' || strength === 'strong') {
      strength = 'good';
      color = '#84CC16';
      label = 'Good';
    }
  }

  return {
    strength,
    score,
    color,
    label,
    requirementsMet: req,
  };
}

export function generateSecureChildPassword(length: number = 16) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*_-+=?';
  const all = upper + lower + numbers + special;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  // Ensure at least one from each category
  const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
  while (chars.length < length) chars.push(pick(all));

  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}


