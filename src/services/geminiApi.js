import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const CHUNK_SIZE = 12000;
const CHUNK_OVERLAP = 500;

function splitIntoChunks(text) {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

function isRateLimitError(error) {
  const message = error?.message || '';
  const status = error?.status;
  return status === 429 || message.includes('429') || message.toLowerCase().includes('rate limit');
}

async function retryGenerateContent(prompt) {
  let lastError;

  for (let attempt = 0; attempt <= 4; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === 4) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function parseJsonResponse(raw) {
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse JSON response: ${raw.slice(0, 200)}`);
  }
}

function validateFlashcards(data) {
  if (!Array.isArray(data)) {
    throw new Error('Expected flashcards response to be an array');
  }
  for (const card of data) {
    if (typeof card?.question !== 'string' || typeof card?.answer !== 'string') {
      throw new Error('Malformed flashcard: each item must have question and answer strings');
    }
  }
  return data;
}

function validateQuiz(data) {
  if (!Array.isArray(data)) {
    throw new Error('Expected quiz response to be an array');
  }
  for (const item of data) {
    if (
      typeof item?.question !== 'string' ||
      !Array.isArray(item?.options) ||
      item.options.length !== 4 ||
      typeof item?.correct !== 'number'
    ) {
      throw new Error('Malformed quiz item: expected question, 4 options, and correct index');
    }
  }
  return data;
}

function deduplicateByQuestion(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.question.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Dynamically calculate how many cards to request based on text length
function getFlashcardCount(textLength) {
  if (textLength < 1000) return 5;
  if (textLength < 3000) return 10;
  if (textLength < 6000) return 15;
  if (textLength < 12000) return 20;
  return 25; // per chunk for very large texts
}

function getQuizCount(textLength) {
  if (textLength < 1000) return 5;
  if (textLength < 3000) return 10;
  if (textLength < 6000) return 15;
  if (textLength < 12000) return 20;
  return 25; // per chunk for very large texts
}

async function generateFlashcardsFromChunk(text) {
  const count = getFlashcardCount(text.length);
  const prompt = `Convert the following study notes into exactly ${count} flashcards.
- Cover the most important concepts, definitions, and facts.
- Each flashcard should test a single distinct concept.
- Vary the question types (definitions, explanations, comparisons, examples).
Return ONLY a raw JSON array. No markdown, no explanation, no code fences.
Format: [{"question": "...", "answer": "..."}]
Notes: ${text}`;

  const raw = await retryGenerateContent(prompt);
  return validateFlashcards(parseJsonResponse(raw));
}

async function generateQuizFromChunk(text) {
  const count = getQuizCount(text.length);
  const prompt = `Create exactly ${count} multiple choice questions from the following notes.
- Cover the most important concepts spread across the entire content.
- Vary difficulty: include recall, comprehension, and application questions.
- Make all 4 options plausible to avoid obvious answers.
Return ONLY a raw JSON array. No markdown, no explanation, no code fences.
Each item: {"question":"...","options":["A","B","C","D"],"correct":0}
'correct' is the 0-based index of the right answer.
Notes: ${text}`;

  const raw = await retryGenerateContent(prompt);
  return validateQuiz(parseJsonResponse(raw));
}

async function generateSummaryFromChunk(text) {
  const prompt = `Write a concise TL;DR summary (5-8 bullet points) of the following notes.
Return plain text only. No markdown headers. Use • as bullet character.
Notes: ${text}`;

  return retryGenerateContent(prompt);
}

export async function generateFlashcards(text) {
  const chunks = splitIntoChunks(text);
  const results = await Promise.all(chunks.map(generateFlashcardsFromChunk));
  return deduplicateByQuestion(results.flat());
}

export async function generateQuiz(text) {
  const chunks = splitIntoChunks(text);
  const results = await Promise.all(chunks.map(generateQuizFromChunk));
  return deduplicateByQuestion(results.flat());
}

export async function generateSummary(text) {
  const chunks = splitIntoChunks(text);

  if (chunks.length === 1) {
    return generateSummaryFromChunk(text);
  }

  const chunkSummaries = await Promise.all(chunks.map(generateSummaryFromChunk));
  const combined = chunkSummaries.join('\n\n');

  const finalPrompt = `Write a concise TL;DR summary (5-8 bullet points) of the following notes.
Return plain text only. No markdown headers. Use • as bullet character.
Notes: ${combined}`;

  return retryGenerateContent(finalPrompt);
}