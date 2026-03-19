export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

type StringOptions = {
  maxLength: number;
  minLength?: number;
};

type NumberOptions = {
  min?: number;
  max?: number;
  integer?: boolean;
};

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function getRequiredTrimmedString(
  value: unknown,
  field: string,
  { maxLength, minLength = 1 }: StringOptions
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new ValidationError(`${field} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

export function getOptionalTrimmedString(
  value: unknown,
  field: string,
  { maxLength }: StringOptions
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

export function getNumber(
  value: unknown,
  field: string,
  { min, max, integer = false }: NumberOptions = {}
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${field} must be a valid number`);
  }
  if (integer && !Number.isInteger(parsed)) {
    throw new ValidationError(`${field} must be a whole number`);
  }
  if (min !== undefined && parsed < min) {
    throw new ValidationError(`${field} must be at least ${min}`);
  }
  if (max !== undefined && parsed > max) {
    throw new ValidationError(`${field} must be at most ${max}`);
  }

  return parsed;
}

export function getOptionalNumber(
  value: unknown,
  field: string,
  options: NumberOptions = {}
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return getNumber(value, field, options);
}

export function getOptionalBoolean(
  value: unknown,
  field: string
): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new ValidationError(`${field} must be true or false`);
  }

  return value;
}

export function getRequiredHttpUrl(
  value: unknown,
  field: string,
  maxLength = 2000
): string {
  const raw = getRequiredTrimmedString(value, field, { maxLength });
  return parseHttpUrl(raw, field);
}

export function getOptionalHttpUrl(
  value: unknown,
  field: string,
  maxLength = 2000
): string | null | undefined {
  const raw = getOptionalTrimmedString(value, field, { maxLength });
  if (raw === undefined || raw === null) {
    return raw;
  }

  return parseHttpUrl(raw, field);
}

export function getOptionalStringArray(
  value: unknown,
  field: string,
  maxItems: number,
  maxItemLength: number
): string[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    throw new ValidationError(`${field} must be an array`);
  }
  if (value.length > maxItems) {
    throw new ValidationError(`${field} must have ${maxItems} items or fewer`);
  }

  const normalized = Array.from(
    new Set(
      value.map((item) =>
        getRequiredTrimmedString(item, field, {
          maxLength: maxItemLength,
        })
      )
    )
  );

  return normalized.length > 0 ? normalized : null;
}

export function getOrderStatus(value: unknown): OrderStatus | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new ValidationError("status must be a string");
  }
  if (!ORDER_STATUSES.includes(value as OrderStatus)) {
    throw new ValidationError("Invalid order status");
  }

  return value as OrderStatus;
}

function parseHttpUrl(value: string, field: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new ValidationError(`${field} must use http or https`);
    }

    return url.toString();
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(`${field} must be a valid URL`);
  }
}
