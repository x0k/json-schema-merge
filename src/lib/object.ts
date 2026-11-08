export function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

/**
 * Reads an own property, returning `undefined` for missing and inherited keys.
 */
export function getOwn<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return Object.hasOwn(obj, key) ? obj[key] : undefined;
}

/**
 * Writes an own property, including a key named `__proto__` that a plain
 * assignment would hand to the prototype setter instead.
 */
export function setOwn<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  if (key === "__proto__") {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  } else {
    obj[key] = value;
  }
}

const objProto = Object.prototype;

export function isRecordEmpty<R extends Record<string, any>>(
  rec: R | Record<string, never>
): rec is Record<string, never> {
  for (const key in rec) {
    if (objProto.hasOwnProperty.call(rec, key)) {
      return false;
    }
  }
  return true;
}
