// Claude model ID to use for all generation
export const CLAUDE_MODEL = "claude-sonnet-4-6";

// Standard generation config
export const DEFAULT_MAX_TOKENS = 2000;
export const DEFAULT_TEMPERATURE = 0.7;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeCallOptions {
  apiKey: string;
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  success: boolean;
  text: string | null;
  parsedJson: unknown | null;
  error: string | null;
  usage?: { input_tokens: number; output_tokens: number };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract JSON from text, handling ```json fences.
 * Returns null if parsing fails.
 */
export function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```json\s*([\s\S]*?)\s*```$/);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

/**
 * Main function: call Claude and return structured response.
 * On error, returns { success: false, error, text: null, parsedJson: null } — never throws.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeResponse> {
  const {
    apiKey,
    system,
    messages,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
  } = options;

  const body: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (system) {
    body.system = system;
  }

  try {
    // Retry only on 429 (rate limit) and 529 (overloaded). 2 retries after the
    // initial attempt (3 total), with backoff of 1s then 3s.
    const RETRY_DELAYS_MS = [1000, 3000];
    let response: Response;
    let responseBody: string;
    let attempt = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      responseBody = await response.text();

      const isRetryable = response.status === 429 || response.status === 529;
      if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
        break;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
      attempt += 1;
    }

    if (!response.ok) {
      return {
        success: false,
        text: null,
        parsedJson: null,
        error: `Claude API ${response.status}: ${responseBody}`,
      };
    }

    const data = JSON.parse(responseBody);
    const text = data?.content?.[0]?.text ?? null;

    if (!text) {
      return {
        success: false,
        text: null,
        parsedJson: null,
        error: "Claude API response missing text content",
      };
    }

    const parsedJson = extractJson(text);

    return {
      success: true,
      text,
      parsedJson,
      error: null,
      usage: data?.usage,
    };
  } catch (err) {
    return {
      success: false,
      text: null,
      parsedJson: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
