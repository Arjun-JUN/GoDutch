/**
 * Google AI Edge — Chrome built-in AI (Gemini Nano via window.ai.languageModel)
 * https://developer.chrome.com/docs/ai/built-in
 *
 * Falls back gracefully when the API is unavailable. Callers should check
 * `isEdgeAIReady()` before invoking the task functions, or catch errors and
 * fall back to the server API.
 */

/** Parse JSON that may be wrapped in a markdown code block. */
function extractJsonBlock(text) {
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) return JSON.parse(codeMatch[1].trim());
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) return JSON.parse(jsonMatch[1]);
  return JSON.parse(text.trim());
}

/**
 * Returns the availability of the on-device language model.
 * Handles both the current `availability()` API and the older `capabilities()` API.
 * @returns {Promise<"readily"|"after-download"|"unavailable">}
 */
export async function edgeAIAvailability() {
  if (typeof window === 'undefined' || !window.ai?.languageModel) {
    return 'unavailable';
  }
  try {
    if (typeof window.ai.languageModel.availability === 'function') {
      return await window.ai.languageModel.availability();
    }
    // Older Chrome origin-trial API
    const caps = await window.ai.languageModel.capabilities();
    if (!caps || caps.available === 'no') return 'unavailable';
    return caps.available === 'readily' ? 'readily' : 'after-download';
  } catch {
    return 'unavailable';
  }
}

/**
 * Returns true only when the model is ready to use without a download.
 */
export async function isEdgeAIReady() {
  return (await edgeAIAvailability()) === 'readily';
}

// ---------------------------------------------------------------------------
// Smart Split
// ---------------------------------------------------------------------------

const SMART_SPLIT_SYSTEM =
  'You are an intelligent expense splitting assistant. ' +
  'Create precise split plans using only the provided group member ids. ' +
  'If the instruction is ambiguous, set clarification_needed to true and ask one concise question. ' +
  'Return valid JSON only — no markdown, no explanation — with this exact shape: ' +
  '{"split_plan": {"items": [{"name": string, "price": number, "category": string, "assigned_to": [string]}], ' +
  '"split_type": "custom|equal|item-based"}, "clarification_needed": boolean, "clarification_question": string | null}';

/**
 * Run smart-split on-device using Chrome's built-in Gemini Nano.
 * @param {{ instruction: string, membersInfo: string, expenseContext?: object }} params
 * @returns {Promise<object>} Parsed SmartSplitResponse
 */
export async function smartSplitEdge({ instruction, membersInfo, expenseContext }) {
  const session = await window.ai.languageModel.create({ systemPrompt: SMART_SPLIT_SYSTEM });
  try {
    let prompt = `Group members: ${membersInfo}\n\nInstruction: ${instruction}`;
    if (expenseContext) prompt += `\n\nExpense context: ${JSON.stringify(expenseContext)}`;
    const response = await session.prompt(prompt);
    return extractJsonBlock(response);
  } finally {
    session.destroy();
  }
}

// ---------------------------------------------------------------------------
// Receipt OCR
// ---------------------------------------------------------------------------

const RECEIPT_SYSTEM =
  'You extract structured data from receipt images. ' +
  'Return valid JSON only — no markdown, no explanation — with this exact shape: ' +
  '{"merchant": string, "date": "YYYY-MM-DD", "total_amount": number, ' +
  '"items": [{"name": string, "price": number}]}. ' +
  'If an exact item list is not visible, return best available items without inventing values. ' +
  'If the date is unclear, use an empty string.';

/**
 * Scan a receipt image on-device using Chrome's built-in Gemini Nano.
 * @param {File|Blob} imageFile  The receipt image file (Blob is accepted by the Prompt API).
 * @returns {Promise<object>} Parsed OCRResult
 */
export async function scanReceiptEdge(imageFile) {
  const session = await window.ai.languageModel.create({ systemPrompt: RECEIPT_SYSTEM });
  try {
    const response = await session.prompt([
      { type: 'image', content: imageFile },
      { type: 'text', content: 'Extract the receipt data as JSON.' },
    ]);
    return extractJsonBlock(response);
  } finally {
    session.destroy();
  }
}
