/**
 * Component prop validation utilities
 * Use these to prevent "Cannot read properties of undefined" errors
 */

/**
 * Validate and return safe array prop
 */
export function validateArrayProp<T>(
  prop: unknown,
  propName: string,
  componentName: string,
  defaultValue: T[] = []
): T[] {
  if (!Array.isArray(prop)) {
    if (prop !== undefined && prop !== null) {
      console.warn(
        `[${componentName}] Invalid ${propName} prop: expected array, got ${typeof prop}`,
        prop
      );
    }
    return defaultValue;
  }
  return prop;
}

/**
 * Validate and return safe object prop
 */
export function validateObjectProp<T>(
  prop: unknown,
  propName: string,
  componentName: string,
  defaultValue: T = {} as T
): T {
  if (typeof prop !== 'object' || prop === null || Array.isArray(prop)) {
    if (prop !== undefined) {
      console.warn(
        `[${componentName}] Invalid ${propName} prop: expected object, got ${typeof prop}`,
        prop
      );
    }
    return defaultValue;
  }
  return prop as T;
}

/**
 * Validate and return safe function prop
 */
export function validateFunctionProp(
  prop: unknown,
  propName: string,
  componentName: string
): ((...args: any[]) => void) | undefined {
  if (prop !== undefined && typeof prop !== 'function') {
    console.warn(
      `[${componentName}] Invalid ${propName} prop: expected function, got ${typeof prop}`,
      prop
    );
    return undefined;
  }
  return prop as ((...args: any[]) => void) | undefined;
}

/**
 * Validate component props on mount (for debugging)
 */
export function validateComponentProps(
  props: Record<string, unknown>,
  componentName: string,
  schema: Record<string, 'array' | 'object' | 'function' | 'string' | 'number' | 'boolean'>
): void {
  if (process.env.NODE_ENV === 'development') {
    Object.entries(schema).forEach(([propName, expectedType]) => {
      const prop = props[propName];
      
      if (prop === undefined) {
        // Optional props are fine
        return;
      }

      let isValid = false;
      switch (expectedType) {
        case 'array':
          isValid = Array.isArray(prop);
          break;
        case 'object':
          isValid = typeof prop === 'object' && prop !== null && !Array.isArray(prop);
          break;
        case 'function':
          isValid = typeof prop === 'function';
          break;
        case 'string':
          isValid = typeof prop === 'string';
          break;
        case 'number':
          isValid = typeof prop === 'number';
          break;
        case 'boolean':
          isValid = typeof prop === 'boolean';
          break;
      }

      if (!isValid) {
        console.error(
          `[${componentName}] Invalid prop "${propName}": expected ${expectedType}, got ${typeof prop}`,
          prop
        );
      }
    });
  }
}

