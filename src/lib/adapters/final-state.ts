export type FinalStateConfig = {
  callbackUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  pollMs?: number;
  maxRetries?: number;
};

export type FinalStateResult = {
  success: boolean;
  state: Record<string, unknown>;
  pollCount: number;
  totalMs: number;
  settled: boolean;
};

export async function pollFinalState(
  config: FinalStateConfig,
  params: Record<string, string>
): Promise<FinalStateResult> {
  const timeout = config.timeoutMs || 5000;
  const pollInterval = config.pollMs || 500;
  const maxRetries = config.maxRetries || Math.ceil(timeout / pollInterval);

  const url = new URL(config.callbackUrl);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  let pollCount = 0;
  const startTime = Date.now();

  while (pollCount < maxRetries) {
    pollCount++;

    try {
      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        signal: AbortSignal.timeout(Math.min(pollInterval * 2, 10000)),
      });

      if (!res.ok) {
        if (Date.now() - startTime >= timeout) break;
        await sleep(pollInterval);
        continue;
      }

      const state = await res.json();
      const elapsed = Date.now() - startTime;

      return {
        success: true,
        state,
        pollCount,
        totalMs: elapsed,
        settled: true,
      };
    } catch {
      if (Date.now() - startTime >= timeout) break;
      await sleep(pollInterval);
    }
  }

  return {
    success: false,
    state: {},
    pollCount,
    totalMs: Date.now() - startTime,
    settled: false,
  };
}

export async function queryFinalStateOnce(
  url: string,
  params: Record<string, string>,
  headers?: Record<string, string>
): Promise<Record<string, unknown>> {
  const fullUrl = new URL(url);
  for (const [key, val] of Object.entries(params)) {
    fullUrl.searchParams.set(key, val);
  }

  const res = await fetch(fullUrl.toString(), {
    headers: { "Content-Type": "application/json", ...headers },
  });

  if (!res.ok) throw new Error(`Final state query failed: ${res.status}`);
  return res.json();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
