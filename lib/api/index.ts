/**
 * lib/api/index.ts — the port selection point.
 * Defaults to the deterministic mock; set NEXT_PUBLIC_USE_BACKEND=1 to talk to
 * the real backend (beside-pet-api) over HTTP/SSE. Components/stores only ever
 * see `api`; they don't know mock vs real.
 */
import { httpApi } from './http';
import { mockApi } from './mock';
import type { Api } from './types';

const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND === '1';

export const api: Api = useBackend ? httpApi : mockApi;

export type {
  Api,
  DailyState,
  DoneEvent,
  EatingState,
  GriefPath,
  GriefProfile,
  HistoryMessage,
  LossType,
  MetaEvent,
  MindReport,
  ReportSection,
  ReportSectionKey,
  SessionListItem,
  SessionStateView,
  SituationType,
  SleepState,
  StartRequest,
  StreamEvent,
  SupportLevel,
  TaskId,
  TogetherRange,
  TokenEvent,
  TurnResult,
} from './types';
