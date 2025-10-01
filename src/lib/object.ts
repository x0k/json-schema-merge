export function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
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
