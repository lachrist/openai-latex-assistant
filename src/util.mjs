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

/**
 * @type {<K extends string>(
 *   key: K,
 * ) => <V>(
 *   obj: { [key in K]: V },
 * ) => V}
 */
export const compileGet = (key) => (obj) => obj[key];

/**
 * @type {(
 *   error: unknown,
 * ) => string}
 */
export const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  } else {
    return "An unknown error occurred";
  }
};
