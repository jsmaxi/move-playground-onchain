"use server";

import { ChatWithAssistantRequest, ContractCode } from "./models";

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

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status} ${result}`);
    }

    console.error("Success:", result);
    return result;
  } catch (error: any) {
    console.error("API route error:", error);
    return error;
  }
}

export async function postAudit(code: string, move_toml: string) {
  const cc: ContractCode = { code, move_toml };
  const url = process.env.AUDIT_API_URL ?? "";
  return await POST(JSON.stringify(cc), url);
}

export async function postCompile(code: string, move_toml: string) {
  const cc: ContractCode = { code, move_toml };
  const url = process.env.COMPILE_API_URL ?? "";
  return await POST(JSON.stringify(cc), url);
}

export async function postDeploy(code: string, move_toml: string) {
  const cc: ContractCode = { code, move_toml };
  const url = process.env.DEPLOY_API_URL ?? "";
  return await POST(JSON.stringify(cc), url);
}

export async function postChat(question: string) {
  const cc: ChatWithAssistantRequest = { question };
  const url = process.env.CHAT_API_URL ?? "";
  return await POST(JSON.stringify(cc), url);
}
