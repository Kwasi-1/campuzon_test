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

function normalizeInstitution(value: unknown): User["institution"] | undefined {
  const raw = toRecord(value);
  const id = toString(raw.id);
  const name = toString(raw.name);

  if (!id || !name) return undefined;

  return {
    id,
    name,
    shortName: toNullableString(raw.shortName ?? raw.short_name),
    region: toString(raw.region),
    city: toNullableString(raw.city),
    isActive: toBoolean(raw.isActive, true),
  };
}

function normalizeResidence(value: unknown): User["residence"] | undefined {
  const raw = toRecord(value);
  const id = toString(raw.id);

  if (!id) return undefined;

  const hasAddressShape =
    raw.gpsLocation !== undefined ||
    raw.hostelName !== undefined ||
    raw.userID !== undefined ||
    raw.userId !== undefined;

  if (hasAddressShape) {
    const rawType = toString(raw.type ?? raw.hostel).toLowerCase();
    const addressType: "off-campus" | "home" = rawType === "home" ? "home" : "off-campus";

    return {
      id,
      userID: toString(raw.userID ?? raw.userId),
      name: toString(raw.name ?? raw.hostelName),
      gpsLocation: toString(raw.gpsLocation),
      type: addressType,
      isActive: toBoolean(raw.isActive, true),
    };
  }

  return {
    id,
    name: toString(raw.name),
    institutionID: toString(raw.institutionID ?? raw.institutionId),
    isActive: toBoolean(raw.isActive, true),
  };
}

function normalizeStore(value: unknown): User["store"] | undefined {
  const raw = toRecord(value);
  const id = toString(raw.id);
  if (!id) return undefined;

  return {
    id,
    storeName: toString(raw.storeName ?? raw.name),
    storeSlug: toString(raw.storeSlug ?? raw.slug),
    description: toNullableString(raw.description),
    logo: toNullableString(raw.logo),
    banner: toNullableString(raw.banner),
    email: toString(raw.email),
    phoneNumber: toString(raw.phoneNumber),
    status: toString(raw.status, "pending") as User["store"]["status"],
    isVerified: toBoolean(raw.isVerified, false),
    rating:
      raw.rating === null || raw.rating === undefined
        ? null
        : Number(toString(raw.rating, "0")),
    totalSales:
      raw.totalSales === undefined ? undefined : Number(toString(raw.totalSales, "0")),
    totalOrders:
      raw.totalOrders === undefined ? undefined : Number(toString(raw.totalOrders, "0")),
    institutionID: toNullableString(raw.institutionID ?? raw.institutionId),
    autoResponderEnabled: toBoolean(raw.autoResponderEnabled, false),
    autoResponderName: toNullableString(raw.autoResponderName),
    autoAcceptOrders: toBoolean(raw.autoAcceptOrders, false),
    dateCreated: toString(raw.dateCreated),
  };
}

export function normalizeUser(rawValue: unknown): User {
  const raw = toRecord(rawValue);
  const institution = normalizeInstitution(raw.institution);
  const residence = normalizeResidence(raw.residence);

  // Handle case where ID fields contain full objects instead of strings
  const institutionIDRaw = raw.institutionID;
  const institutionID =
    toNullableString(
      typeof institutionIDRaw === "object"
        ? (institutionIDRaw as UnknownRecord)?.id
        : institutionIDRaw,
    ) ??
    toNullableString(raw.institutionId) ??
    toNullableString(raw.institution_id);

  const hallIDRaw = raw.hallID;
  const hallID =
    toNullableString(
      typeof hallIDRaw === "object" ? (hallIDRaw as UnknownRecord)?.id : hallIDRaw,
    ) ??
    toNullableString(raw.hallId) ??
    toNullableString(raw.hall_id);

  // Handle case where institution field is an object with name
  const institutionNameRaw = raw.institutionName;
  const institutionName =
    toNullableString(
      typeof institutionNameRaw === "object"
        ? (institutionNameRaw as UnknownRecord)?.name
        : institutionNameRaw,
    ) ??
    toNullableString(raw.institution_name) ??
    toNullableString(
      typeof raw.institutionID === "object"
        ? (raw.institutionID as UnknownRecord)?.name
        : undefined,
    ) ??
    toNullableString(institution?.name) ??
    undefined;

  // Handle case where residence/hallID field is an object with name
  const residenceNameRaw = raw.residenceName;
  const residenceName =
    toNullableString(
      typeof residenceNameRaw === "object"
        ? (residenceNameRaw as UnknownRecord)?.name
        : residenceNameRaw,
    ) ??
    toNullableString(raw.hallName) ??
    toNullableString(
      typeof raw.hallID === "object" ? (raw.hallID as UnknownRecord)?.name : undefined,
    ) ??
    toNullableString(residence?.name) ??
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
    institution,
    residence,
    residenceName,
    store: normalizeStore(raw.store),
    institutionName,
  };
}
