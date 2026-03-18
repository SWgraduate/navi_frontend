/**
 * API 바렐(export) 파일입니다.
 *
 * - **어떨 때 쓰나**: 앱 코드에서 `@/lib/api` 한 곳에서 함수/타입을 import 하고 싶을 때 사용합니다.
 * - **구성**: `auth`, `chat`, `student`, `rag` 모듈을 재-export 합니다.
 */

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
