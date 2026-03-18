export { apiFetch } from "./client";
export type { ApiError } from "./client";
export {
  register,
  login,
  logout,
  leave,
  sendAuthEmail,
  verifyAuthEmail,
} from "./auth";
export type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  SendEmailRequest,
  SendEmailResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./auth";
export { sendChatQuery, getChatStatus } from "./chat";
export type { ChatRequest, ChatTaskResponse, ChatStatusResponse } from "./chat";

export {
  upsertMyProfile,
  getMyProfile,
  getMyAcademicRecord,
  updateMyAcademicRecord,
  parseAndUpdateMyAcademicRecordFromImage,
} from "./student";
export type {
  ApiErrorShape,
  SecondMajorType,
  AcademicStatus,
  StudentResponse,
  UpsertProfileRequest,
  EarnedCredits,
  SecondMajorCredits,
  CompletedConditions,
  TakenCourse,
  AcademicRecordResponse,
  UpdateAcademicRecordRequest,
  ParseImageRequest,
} from "./student";

export { uploadRagPdf } from "./rag";
export type { UploadPdfRequest, IngestPdfResult, IngestionStatus } from "./rag";
