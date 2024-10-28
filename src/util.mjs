/**
 * @type {<X>(
 *   value: X | null,
 * ) => value is X}
 */
export const isNotNull = (value) => value !== null;

/**
 * @type {(
 *   key: string,
 * ) => [string, null | string]}
 */
export const toNullableStringEntry = (key) => [key, null];

/**
 * @type {<V>(
 *   obj: {[key in string]: V | undefined | null},
 *   key: string,
 * ) => V | null}
 */
export const get = (obj, key) =>
  Object.hasOwn(obj, key) ? (obj[key] ?? null) : null;
