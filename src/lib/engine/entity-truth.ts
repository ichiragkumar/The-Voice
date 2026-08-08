const HINDI_NUMBERS: Record<string, number> = {
  shunya: 0, ek: 1, do: 2, teen: 3, chaar: 4, paanch: 5,
  chhah: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyaarah: 11, baarah: 12, terah: 13, chaudah: 14, pandrah: 15,
  solah: 16, satrah: 17, atharah: 18, unees: 19, bees: 20,
  ikkees: 21, baaees: 22, teis: 23, chaubees: 24, pacchees: 25,
  chhabbees: 26, sattaees: 27, atthaees: 28, untees: 29, tees: 30,
  ikatees: 31, battees: 32, taintees: 33, chautees: 34, paintees: 35,
  chhattees: 36, saintees: 37, adtees: 38, untaalees: 39, chaalees: 40,
  iktaalees: 41, bayaalees: 42, taintaalees: 43, chavaalees: 44, paintaalees: 45,
  chhiyaalees: 46, saintaalees: 47, adtaalees: 48, unchaas: 49, pachaas: 50,
  ikyaavan: 51, baavan: 52, tirpan: 53, chauvan: 54, pachpan: 55,
  chhappan: 56, sattaavan: 57, atthaavan: 58, unsath: 59, saath: 60,
  iksath: 61, baasath: 62, tirsath: 63, chausath: 64, painsath: 65,
  chhiyasath: 66, sadsath: 67, adsath: 68, unhattar: 69, sattar: 70,
  ikhattar: 71, bahattar: 72, tihattar: 73, chauhattar: 74, pachhattar: 75,
  chhihattar: 76, satahattar: 77, athahattar: 78, unaasi: 79, assi: 80,
  ikyaasi: 81, bayaasi: 82, tiraasi: 83, chauraasi: 84, pachaasi: 85,
  chhiyaasi: 86, sataasi: 87, athaasi: 88, navaasi: 89, nabbe: 90,
  ikyaanbe: 91, baanbe: 92, tiraanbe: 93, chauraanbe: 94, pachaanbe: 95,
  chhiyaanbe: 96, sattaanbe: 97, atthaanbe: 98, ninyanve: 99,
};

const HINDI_MULTIPLIERS: Record<string, number> = {
  sau: 100, hazaar: 1000, lakh: 100000, crore: 10000000,
};

const HINDI_SPECIAL_AMOUNTS: Record<string, number> = {
  "dedh sau": 150, "dhai sau": 250,
  "dedh hazaar": 1500, "dhai hazaar": 2500,
  "dedh lakh": 150000, "dhai lakh": 250000,
  "dedh crore": 15000000, "dhai crore": 25000000,
};

const HINDI_TIME_PATTERNS: Record<string, string> = {
  "saade ek": "01:30", "saade do": "02:30", "saade teen": "03:30",
  "saade chaar": "04:30", "saade paanch": "05:30", "saade chhah": "06:30",
  "saade saat": "07:30", "saade aath": "08:30", "saade nau": "09:30",
  "saade das": "10:30", "saade gyaarah": "11:30", "saade baarah": "12:30",
  "paune do": "01:45", "paune teen": "02:45", "paune chaar": "03:45",
  "paune paanch": "04:45", "paune chhah": "05:45", "paune saat": "06:45",
  "paune aath": "07:45", "paune nau": "08:45", "paune das": "09:45",
  "paune gyaarah": "10:45", "paune baarah": "11:45",
  "sawa ek": "01:15", "sawa do": "02:15", "sawa teen": "03:15",
  "sawa chaar": "04:15", "sawa paanch": "05:15", "sawa chhah": "06:15",
  "sawa saat": "07:15", "sawa aath": "08:15", "sawa nau": "09:15",
  "sawa das": "10:15", "sawa gyaarah": "11:15", "sawa baarah": "12:15",
};

const SPOKEN_DIGIT_MAP: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4",
  five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  double: "", triple: "",
};

export function normalizeHindiNumber(text: string): number | null {
  const lower = text.toLowerCase().replace(/[₹,]/g, "").trim();

  for (const [pattern, value] of Object.entries(HINDI_SPECIAL_AMOUNTS)) {
    if (lower.includes(pattern)) return value;
  }

  const words = lower.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    if (HINDI_NUMBERS[word] !== undefined) {
      current += HINDI_NUMBERS[word];
    } else if (HINDI_MULTIPLIERS[word]) {
      current = (current || 1) * HINDI_MULTIPLIERS[word];
      total += current;
      current = 0;
    } else {
      const num = parseInt(word);
      if (!isNaN(num)) current += num;
    }
  }

  total += current;
  return total > 0 ? total : null;
}

export function normalizeHindiTime(text: string): string | null {
  const lower = text.toLowerCase().trim();

  for (const [pattern, time] of Object.entries(HINDI_TIME_PATTERNS)) {
    if (lower.includes(pattern)) {
      const isPM = /shaam|dopahar|raat/.test(lower);
      const isAM = /subah/.test(lower);
      if (isPM) {
        const [h, m] = time.split(":");
        const hour = parseInt(h);
        if (hour < 12) return `${hour + 12}:${m}`;
      }
      return time;
    }
  }

  const basicMatch = lower.match(
    /(\w+)\s*baje/
  );
  if (basicMatch) {
    const hourWord = basicMatch[1];
    const hour = HINDI_NUMBERS[hourWord];
    if (hour !== undefined) {
      const isPM = /shaam|dopahar/.test(lower);
      const finalHour = isPM && hour < 12 ? hour + 12 : hour;
      return `${finalHour.toString().padStart(2, "0")}:00`;
    }
  }

  return null;
}

export function normalizeSpokenDigits(text: string): string {
  const lower = text.toLowerCase().trim();
  let result = "";
  const words = lower.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word === "double" && i + 1 < words.length) {
      const next = SPOKEN_DIGIT_MAP[words[i + 1]] || words[i + 1];
      result += next + next;
      i++;
    } else if (word === "triple" && i + 1 < words.length) {
      const next = SPOKEN_DIGIT_MAP[words[i + 1]] || words[i + 1];
      result += next + next + next;
      i++;
    } else if (SPOKEN_DIGIT_MAP[word] !== undefined) {
      result += SPOKEN_DIGIT_MAP[word] || word;
    } else if (/^\d+$/.test(word)) {
      result += word;
    } else {
      result += word;
    }
  }

  return result;
}

export function normalizeHindiDate(
  text: string,
  referenceDate: Date
): string | null {
  const lower = text.toLowerCase().trim();
  const ref = new Date(referenceDate);

  if (/\baaj\b/.test(lower)) return formatDate(ref);
  if (/\bkal\b/.test(lower) && !/\bparson\b/.test(lower)) {
    ref.setDate(ref.getDate() + 1);
    return formatDate(ref);
  }
  if (/\bparson\b|\bparso\b/.test(lower)) {
    ref.setDate(ref.getDate() + 2);
    return formatDate(ref);
  }
  if (/uske agle din|uske baad wala din/.test(lower)) {
    ref.setDate(ref.getDate() + 2);
    return formatDate(ref);
  }
  if (/\bagle\b.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(lower) ||
      /\baane wala\b.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(lower) ||
      /\bnext\b.*\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(lower)) {
    const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) return getNextWeekday(ref, dayMatch[1]);
  }
  if (/is mahine ki aakhri tareekh/.test(lower)) {
    const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return formatDate(lastDay);
  }

  return null;
}

function getNextWeekday(from: Date, dayName: string): string {
  const days: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };
  const target = days[dayName.toLowerCase()];
  const current = from.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  from.setDate(from.getDate() + diff);
  return formatDate(from);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function fuzzyAmountMatch(expected: number, actual: number): boolean {
  if (expected === actual) return true;
  const tolerance = Math.max(expected * 0.01, 1);
  return Math.abs(expected - actual) <= tolerance;
}

export function fuzzyDateMatch(expected: string, actual: string): boolean {
  if (expected === actual) return true;
  try {
    const e = new Date(expected);
    const a = new Date(actual);
    return Math.abs(e.getTime() - a.getTime()) < 86400000;
  } catch {
    return false;
  }
}
