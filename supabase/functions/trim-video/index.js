import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Command } from "https://deno.land/x/command@v0.0.8/mod.ts";

// 4.1 placeholder — real multi-event detection will replace this
async function detectSkillEvents(_filePath) {
  return [{ start: 0, end: null }];
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { supabasePath, playerId, sessionId, category, filename } = await req.json();

    if (!supabasePath || !playerId || !sessionId || !category || !filename) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Download raw video
    const { data, error } = await supabase.storage.from("media").download(supabasePath);
    if (error || !data) throw new Error(`Failed to download media: ${error?.message}`);

    const rawBytes = new Uint8Array(await data.arrayBuffer());
    const inputPath = `/tmp/input.mp4`;
    await Deno.writeFile(inputPath, rawBytes);

    // 2) Detect skill events
    const events = await detectSkillEvents(inputPath);
    if (!events.length) {
      return new Response(JSON.stringify({ events: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const PADDING = 0.1;
    const trimmedEvents = [];

    // 3) Trim each event
    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      const start = Math.max(0, evt.start - PADDING);
      const end = evt.end != null ? evt.end + PADDING : null;

      const outputPath = `/tmp/output-${i}.mp4`;

      const args = end != null
        ? ["-y", "-i", inputPath, "-ss", `${start}`, "-to", `${end}`, "-c", "copy", outputPath]
        : ["-y", "-i", inputPath, "-ss", `${start}`, "-c", "copy", outputPath];

      const cmd = new Command("ffmpeg", args);
      const { code } = await cmd.output();
      if (code !== 0) throw new Error("ffmpeg trim failed");

      const trimmedBytes = await Deno.readFile(outputPath);

      const eventPath =
        `${playerId}/${sessionId}/${category}/${filename.replace(".mp4", "")}-event-${i}.mp4`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(eventPath, trimmedBytes, {
          contentType: "video/mp4",
          upsert: true
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicData } = supabase.storage.from("media").getPublicUrl(eventPath);

      trimmedEvents.push({
        index: i,
        start,
        end,
        path: eventPath,
        url: publicData.publicUrl
      });

      await Deno.remove(outputPath).catch(() => {});
    }

    // 4) Delete original
    await supabase.storage.from("media").remove([supabasePath]).catch(() => {});

    await Deno.remove(inputPath).catch(() => {});

    return new Response(JSON.stringify({ events: trimmedEvents }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("trim-video error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
