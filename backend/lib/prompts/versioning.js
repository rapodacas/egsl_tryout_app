// backend/lib/prompts/versioning.js
const { supabase } = require("../supabase.js");
const { invalidatePromptCache } = require("./runtime.js");

/**
 * Create a new prompt version for a category.
 */
async function createPromptVersion({
  category,
  subcategories,
  systemPrompt,
  userPromptTemplate,
  updatedBy
}) {
  // 1. Get current highest version
  const { data: versions, error: fetchErr } = await supabase
    .from("prompts")
    .select("version")
    .eq("category", category)
    .order("version", { ascending: false })
    .limit(1);

  if (fetchErr) throw new Error("Failed to fetch prompt versions");

  const nextVersion = versions?.[0]?.version + 1 || 1;

  // 2. Insert new version (inactive by default)
  const { error: insertErr } = await supabase.from("prompts").insert({
    category,
    subcategories,
    system_prompt: systemPrompt,
    user_prompt_template: userPromptTemplate,
    version: nextVersion,
    is_active: false,
    updated_by: updatedBy
  });

  if (insertErr) throw new Error("Failed to create new prompt version");

  return nextVersion;
}

/**
 * Activate a specific version for a category.
 */
async function activatePromptVersion(category, version) {
  // 1. Deactivate all versions
  const { error: deactivateErr } = await supabase
    .from("prompts")
    .update({ is_active: false })
    .eq("category", category);

  if (deactivateErr) throw new Error("Failed to deactivate old versions");

  // 2. Activate the chosen version
  const { error: activateErr } = await supabase
    .from("prompts")
    .update({ is_active: true })
    .eq("category", category)
    .eq("version", version);

  if (activateErr) throw new Error("Failed to activate prompt version");

  // 3. Clear cache so runtime loads fresh version
  invalidatePromptCache(category);

  return true;
}

/**
 * Roll back to the previous version.
 */
async function rollbackPrompt(category) {
  // 1. Fetch all versions sorted newest → oldest
  const { data, error } = await supabase
    .from("prompts")
    .select("version")
    .eq("category", category)
    .order("version", { ascending: false });

  if (error || !data?.length) {
    throw new Error("No versions found for rollback");
  }

  if (data.length < 2) {
    throw new Error("No previous version to roll back to");
  }

  const previousVersion = data[1].version;

  // 2. Activate previous version
  await activatePromptVersion(category, previousVersion);

  return previousVersion;
}

module.exports = { createPromptVersion, activatePromptVersion, rollbackPrompt };
