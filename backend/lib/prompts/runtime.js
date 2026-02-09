// backend/lib/prompts/runtime.js
import supabase from "../supabase.js";

const promptCache = new Map(); // key: category, value: { subcategories, systemPrompt, userPromptTemplate, version }

/**
 * Load the active prompt for a category.
 * Uses in-memory cache for speed, but always source of truth is Supabase.
 */
export default async function loadPrompt(category) {
  if (!category) {
    throw new Error("Category is required to load prompt");
  }

  // 1. Check cache
  const cached = promptCache.get(category);
  if (cached) {
    return buildPromptObject(cached);
  }

  // 2. Load from Supabase
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error(`No active prompt found for category: ${category}`);
  }

  // 3. Basic validation
  validatePromptRow(data, category);

  // 4. Cache it
  promptCache.set(category, {
    subcategories: data.subcategories,
    systemPrompt: data.system_prompt,
    userPromptTemplate: data.user_prompt_template,
    version: data.version
  });

  return buildPromptObject(promptCache.get(category));
}

/**
 * Clear cache for a specific category (e.g., after updating prompts).
 */
export function invalidatePromptCache(category) {
  if (category) promptCache.delete(category);
}

/**
 * Clear all prompt cache (e.g., on deploy or admin action).
 */
export function clearPromptCache() {
  promptCache.clear();
}

// ----------------- Internal helpers -----------------

function buildPromptObject(entry) {
  const { subcategories, systemPrompt, userPromptTemplate, version } = entry;

  return {
    subcategories,
    systemPrompt,
    version,
    userPrompt: frames =>
      userPromptTemplate.replace("{{frames}}", JSON.stringify(frames))
  };
}

function validatePromptRow(row, category) {
  if (!Array.isArray(row.subcategories) || row.subcategories.length === 0) {
    throw new Error(`Prompt for category "${category}" has no subcategories`);
  }

  if (typeof row.system_prompt !== "string" || !row.system_prompt.trim()) {
    throw new Error(`Prompt for category "${category}" is missing system_prompt`);
  }

  if (
    typeof row.user_prompt_template !== "string" ||
    !row.user_prompt_template.includes("{{frames}}")
  ) {
    throw new Error(
      `Prompt for category "${category}" must include user_prompt_template with "{{frames}}"`
    );
  }
}