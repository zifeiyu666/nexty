import { completeCustomVoiceTask } from "@/lib/ai/custom-voices";
import { getLogger } from "@/lib/logger";

const logger = getLogger("kie-voice-webhook");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = body?.data && typeof body.data === "object" ? body.data : {};
    const taskId = body?.task_id || body?.taskId || data?.task_id || data?.taskId;
    const validateInfo = body?.validateInfo || body?.validate_info || data?.validateInfo || data?.validate_info;
    logger.info({ taskId, code: body?.code, status: body?.status || data?.status, message: data?.errorMessage || body?.msg || body?.message, errorCode: data?.errorCode, hasValidateInfo: Boolean(validateInfo), validateInfoLength: validateInfo ? String(validateInfo).length : 0, hasVoiceId: Boolean(body?.voiceId || body?.voice_id || data?.voiceId || data?.voice_id) }, "Received KIE voice webhook");
    if (taskId) {
      await completeCustomVoiceTask(taskId, body);
      logger.info({ taskId }, "Processed KIE voice webhook");
    } else {
      logger.warn({ bodyKeys: Object.keys(body || {}) }, "Received KIE voice webhook without a task ID");
    }
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), "Failed to process KIE voice webhook");
  }
  return Response.json({ status: "received" });
}
