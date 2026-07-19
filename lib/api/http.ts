/**
 * lib/api/http.ts — real backend client.
 * Implements the same Api port as the mock, talking to beside-pet-api over HTTP.
 * The streaming turns consume the backend's Server-Sent Events: one `data:` line
 * per JSON-encoded StreamEvent. The httpOnly auth cookie travels via
 * credentials: 'include' (the JWT never lives in JS).
 */
import type {
  Api,
  HistoryMessage,
  MindReport,
  SessionListItem,
  SessionStateView,
  StartRequest,
  StreamEvent,
  TurnResult,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface MessageBody {
  text: string;
}

type RequestBody = StartRequest | MessageBody | Record<string, never>;

const post = async <T>(path: string, body: RequestBody): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
};

const get = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
};

/** Opens an SSE POST and yields each parsed StreamEvent until the stream ends. */
async function* postStream(path: string, body: RequestBody): AsyncIterable<StreamEvent> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Stream failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const event = parseFrame(frame);
      if (event) {
        yield event;
      }
      boundary = buffer.indexOf('\n\n');
    }
  }
}

/** Parses one SSE frame's `data:` line into a StreamEvent (validated at this boundary). */
function parseFrame(frame: string): StreamEvent | undefined {
  const line = frame.split('\n').find((part) => part.startsWith('data:'));
  if (!line) {
    return undefined;
  }
  const parsed: unknown = JSON.parse(line.slice('data:'.length).trim());
  return asStreamEvent(parsed);
}

function asStreamEvent(value: unknown): StreamEvent | undefined {
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    return undefined;
  }
  const event = value as StreamEvent;
  if (event.kind === 'meta' || event.kind === 'token' || event.kind === 'done') {
    return event;
  }
  return undefined;
}

export const httpApi: Api = {
  start(request: StartRequest): Promise<TurnResult> {
    return post('/v1/sessions', request);
  },

  sendMessage(sessionId: string, text: string): Promise<TurnResult> {
    return post(`/v1/sessions/${sessionId}/messages`, { text });
  },

  startStream(request: StartRequest): AsyncIterable<StreamEvent> {
    return postStream('/v1/sessions/stream', request);
  },

  sendMessageStream(sessionId: string, text: string): AsyncIterable<StreamEvent> {
    return postStream(`/v1/sessions/${sessionId}/messages/stream`, { text });
  },

  listSessions(): Promise<SessionListItem[]> {
    return get('/v1/sessions');
  },

  getSessionState(sessionId: string): Promise<SessionStateView> {
    return get(`/v1/sessions/${sessionId}`);
  },

  getMessages(sessionId: string): Promise<HistoryMessage[]> {
    return get(`/v1/sessions/${sessionId}/messages`);
  },

  getReport(sessionId: string): Promise<MindReport> {
    return get(`/v1/sessions/${sessionId}/report`);
  },

  closeSession(sessionId: string): Promise<SessionStateView> {
    return post(`/v1/sessions/${sessionId}/close`, {});
  },
};
