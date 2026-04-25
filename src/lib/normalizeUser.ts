import type { User, TwoFactorMethod } from "@/types-new";

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  if (value && typeof value === "object") {
    return value as UnknownRecord;
  }
  return {};
}

function toString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = toString(value, "").trim();
  return normalized.length > 0 ? normalized : null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
}

function toTwoFactorMethod(value: unknown): TwoFactorMethod {
  const normalized = toString(value, "none").trim().toLowerCase();
  if (normalized === "otp" || normalized === "totp") {
    return normalized;
  }
  return "none";
}

export function normalizeUser(rawValue: unknown): User {
  const raw = toRecord(rawValue);
  const institution = toRecord(raw.institution);
  const residence = toRecord(raw.residence);

  const institutionID =
    toNullableString(raw.institutionID) ??
    toNullableString(raw.institutionId) ??
    toNullableString(raw.institution_id);

  const hallID =
    toNullableString(raw.hallID) ??
    toNullableString(raw.hallId) ??
    toNullableString(raw.hall_id);

  const institutionName =
    toNullableString(raw.institutionName) ??
    toNullableString(raw.institution_name) ??
    toNullableString(institution.name) ??
    undefined;

  const residenceName =
    toNullableString(raw.residenceName) ??
    toNullableString(raw.hallName) ??
    toNullableString(residence.name) ??
    undefined;

  return {
    id: toString(raw.id),
    firstName: toString(raw.firstName),
    lastName: toString(raw.lastName),
    displayName: toNullableString(raw.displayName),
    email: toString(raw.email),
    phoneNumber: toString(raw.phoneNumber),
    profileImage: toNullableString(raw.profileImage),
    isOwner: toBoolean(raw.isOwner, false),
    isActive: toBoolean(raw.isActive, true),
    isVerified: toBoolean(raw.isVerified, false),
    emailVerified: toBoolean(raw.emailVerified, false),
    phoneVerified: toBoolean(raw.phoneVerified, false),
    institutionID,
    hallID,
    twoFactorEnabled: toBoolean(raw.twoFactorEnabled, false),
    twoFactorMethod: toTwoFactorMethod(raw.twoFactorMethod),
    dateCreated: toString(raw.dateCreated),
    institution: Object.keys(institution).length
      ? (institution as User["institution"])
      : undefined,
    residence: Object.keys(residence).length
      ? (residence as User["residence"])
      : undefined,
    residenceName,
    store: toRecord(raw.store).id
      ? (raw.store as User["store"])
      : undefined,
    institutionName,
  };
}
