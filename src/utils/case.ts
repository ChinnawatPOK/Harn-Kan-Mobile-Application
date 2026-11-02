const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

export const toCamelCase = (key: string) =>
  key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

const convertKeys = (
  value: unknown,
  convert: (key: string) => string,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, convert));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        convert(key),
        convertKeys(item, convert),
      ]),
    );
  }
  return value;
};

export const camelCaseKeys = (value: unknown) =>
  convertKeys(value, toCamelCase);
