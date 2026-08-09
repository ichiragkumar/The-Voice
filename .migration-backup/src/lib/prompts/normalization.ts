export function getNormalizationPrompt(
  entities: Array<{ type: string; rawValue: string; context?: string }>,
  callDate: string
): string {
  return `You are an expert at interpreting Indian language expressions into structured values. The call happened on ${callDate}.

Normalize each entity's rawValue into a structured value:

Date rules:
- "kal" = tomorrow from call date
- "parson" = day after tomorrow
- "uske agle din" = resolve relative to the most recent date reference
- "aane wala Monday" = next Monday from call date
- Day names = the next occurrence of that day from call date

Time rules:
- "saade chaar" (साढ़े चार) = 4:30 (half past four)
- "paune paanch" (पौने पांच) = 4:45 (quarter to five)
- "sawa teen" (सवा तीन) = 3:15 (quarter past three)
- "subah" = AM context (morning)
- "shaam" = PM context (evening, typically 4-8 PM)
- "dopahar" = PM context (afternoon, typically 12-3 PM)
- "raat" = PM/night context (typically 8 PM+)

Number rules:
- "do hazaar paanch sau" = 2500
- "teen sau" = 300

Name rules:
- Strip honorifics for matching: "Sharma ji" → "Sharma", but keep "Dr." prefix
- Keep full names: "Priya Mehta" → "Priya Mehta"

Action rules:
- "kar do" / "karo" / "kar dijiye" with "book/cancel/reschedule" = the action verb
- "rakh do" = book/schedule
- "cancel kar do" = cancel
- "badal do" = change/reschedule

Entities to normalize:
${JSON.stringify(entities, null, 2)}`;
}
