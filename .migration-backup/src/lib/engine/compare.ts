import type { NormalizedEntity } from "./normalize";

export type ComparisonResult = {
  entityType: string;
  rawValue: string;
  expectedValue: string;
  actualValue: string;
  match: boolean;
  severity: "critical" | "warning" | "info";
};

const FIELD_MAPPINGS: Record<string, string[]> = {
  date: ["date", "appointment_date", "visit_date", "booking_date"],
  time: ["time", "appointment_time", "visit_time", "booking_time"],
  name: ["patient_name", "customer_name", "doctor", "name", "technician"],
  phone: ["phone", "mobile", "contact"],
  amount: ["amount", "price", "fee", "cost"],
  address: ["address", "location", "flat", "street"],
  action: ["action", "type", "operation"],
};

function findMatchingField(
  entityType: string,
  toolArgs: Record<string, unknown>
): { key: string; value: string } | null {
  const candidates = FIELD_MAPPINGS[entityType] || [];
  for (const key of candidates) {
    if (key in toolArgs) {
      return { key, value: String(toolArgs[key]) };
    }
  }
  return null;
}

export function compareEntities(
  entities: NormalizedEntity[],
  toolCallArgs: Record<string, unknown>
): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  for (const entity of entities) {
    const field = findMatchingField(entity.type, toolCallArgs);
    if (!field) continue;

    const expected = entity.normalizedValue;
    const actual = field.value;
    const match =
      expected.toLowerCase().trim() === actual.toLowerCase().trim();

    results.push({
      entityType: entity.type,
      rawValue: entity.rawValue,
      expectedValue: expected,
      actualValue: actual,
      match,
      severity: match ? "info" : "critical",
    });
  }

  return results;
}
