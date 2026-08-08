export function getExtractionPrompt(transcript: string, language: string): string {
  return `You are an expert at analyzing Indian voice agent call transcripts. Extract all actionable entities from this ${language} transcript.

For each entity, identify:
- type: one of "name", "date", "time", "phone", "amount", "address", "action"
- rawValue: the exact text as spoken (in original language)
- context: surrounding words that help interpret meaning

Focus on:
- Indian names with honorifics (Sharma ji, Dr. Patel)
- Hindi/Hinglish date expressions (kal, parson, agle din, aane wala Monday)
- Hindi time expressions (saade chaar, paune paanch, subah, shaam, dopahar)
- Hindi numbers (do hazaar, paanch sau)
- Actions (book karo, cancel kar do, reschedule, confirm)
- Addresses with Indian formats (flat number, sector, nagar)

Transcript:
${transcript}`;
}
