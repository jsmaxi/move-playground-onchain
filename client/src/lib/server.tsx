"use server";

async function POST(request: string, url: string) {
  try {
    if (!url) throw "Invalid endpoint url";
    if (!request) throw "Invalid request body";

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: request,
    });

    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    console.error("Success:", result);
    return Response.json({ success: true, data: result });
  } catch (error: any) {
    console.error("API route error:", error);
    return Response.json({ success: false, error: error?.message });
  }
}

export async function postAudit(request: string) {
  const url = process.env.AUDIT_API_URL ?? "";
  return await POST(request, url);
}
