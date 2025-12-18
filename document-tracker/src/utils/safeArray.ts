/**
 * Safe array utilities to prevent "Cannot read properties of undefined" errors
 */

/**
 * Safely get an array, defaulting to empty array if invalid
 */
export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Safely check if value is an array
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safely iterate over an array with validation
 */
export function safeForEach<T>(
  array: unknown,
  callback: (item: T, index: number) => void,
  defaultValue: T[] = []
): void {
  const safeArray = isValidArray<T>(array) ? array : defaultValue;
  safeArray.forEach(callback);
}

/**
 * Safely map over an array with validation
 */
export function safeMap<T, R>(
  array: unknown,
  callback: (item: T, index: number) => R,
  defaultValue: T[] = []
): R[] {
  const safeArray = isValidArray<T>(array) ? array : defaultValue;
  return safeArray.map(callback);
}

/**
 * Safely filter an array with validation
 */
export function safeFilter<T>(
  array: unknown,
  callback: (item: T, index: number) => boolean,
  defaultValue: T[] = []
): T[] {
  const safeArray = isValidArray<T>(array) ? array : defaultValue;
  return safeArray.filter(callback);
}

/**
 * Safely get array length
 */
export function safeLength(array: unknown): number {
  return Array.isArray(array) ? array.length : 0;
}

/**
 * Safely get array item at index
 */
export function safeGet<T>(array: unknown, index: number, defaultValue?: T): T | undefined {
  if (!Array.isArray(array)) return defaultValue;
  return array[index] ?? defaultValue;
}

/**
 * Validate and clean array items (remove null/undefined)
 */
export function cleanArray<T>(array: unknown): T[] {
  const safeArray = isValidArray<T>(array) ? array : [];
  return safeArray.filter((item): item is T => item != null);
}

