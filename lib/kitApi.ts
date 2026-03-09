// Kit (ConvertKit) V3 API helper

const KIT_BASE = "https://api.convertkit.com/v3";

interface KitTag {
  id: number;
  name: string;
  created_at: string;
}

interface KitSubscribeFields {
  dominant_trait?: string;
  composite_score?: string | number;
}

export async function kitSubscribeWithTag(
  email: string,
  fields: KitSubscribeFields,
  tagName: string = "dark-triad-quiz"
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return { success: false, error: "No KIT_API_KEY configured" };

  try {
    // Step 1: Get tags list to find the requested tag
    const tagsRes = await fetch(`${KIT_BASE}/tags?api_key=${apiKey}`);
    if (!tagsRes.ok) {
      return { success: false, error: `Kit tags fetch failed: ${tagsRes.status}` };
    }
    const tagsData = await tagsRes.json();
    const tags: KitTag[] = tagsData.tags ?? [];
    let tag = tags.find((t) => t.name === tagName);

    // Step 2: Create tag if it doesn't exist
    if (!tag) {
      const createRes = await fetch(`${KIT_BASE}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, tag: { name: tagName } }),
      });
      if (!createRes.ok) {
        return { success: false, error: `Kit tag create failed: ${createRes.status}` };
      }
      const createData = await createRes.json();
      tag = Array.isArray(createData) ? createData[0] : createData;
    }

    if (!tag?.id) {
      return { success: false, error: "Could not get Kit tag ID" };
    }

    // Step 3: Subscribe user to the tag with custom fields
    const subRes = await fetch(`${KIT_BASE}/tags/${tag.id}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        fields: {
          dominant_trait: fields.dominant_trait ?? "",
          composite_score: String(fields.composite_score ?? ""),
        },
      }),
    });

    if (!subRes.ok) {
      const errText = await subRes.text();
      return { success: false, error: `Kit subscribe failed: ${subRes.status} ${errText}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
