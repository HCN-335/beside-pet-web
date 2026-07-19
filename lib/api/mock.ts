/**
 * lib/api/mock.ts — deterministic mock implementation.
 * Runs the whole flow without a backend, mirroring the state machine's meaning
 * (depth-gated stage progression, gentle early exit, progress, safety). It is
 * deterministic (no randomness) so regression scenarios reproduce.
 *
 * The reply strings are *content* standing in for the backend/LLM (not UI copy).
 * The conversation language is the profile's preferredLanguage (chosen at
 * onboarding, default English), so the mock replies in that language — mirroring
 * the real backend. Decision rules mirror the backend's deterministic domain
 * (TaskProgressionService); the reply copy is the mock's own stand-in for the
 * live model. Engagement/crisis detection (DUNNO/RISK) is bilingual (ko + en),
 * matching the backend's shared patterns.
 */
import type { Locale } from '@/i18n/config';
import { DEFAULT_LOCALE } from '@/i18n/config';
import type {
  Api,
  GriefProfile,
  HistoryMessage,
  MindReport,
  ReportSectionKey,
  SessionListItem,
  SessionStateView,
  StartRequest,
  StreamEvent,
  SupportLevel,
  TaskId,
  TurnResult,
} from './types';

/** Time-to-first-token the mock waits before streaming, mimicking a live model. */
const STREAM_TTFT_MS = 500;
/** Fixed gap between subsequent chunks. */
const STREAM_TOKEN_GAP_MS = 35;

/** Support language when a profile didn't record one (matches the backend default). */
const DEFAULT_PREFERRED_LANGUAGE: Locale = 'en';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Streams a computed TurnResult as meta → tokens → done, mirroring the backend SSE. */
async function* streamTurn(turn: TurnResult): AsyncIterable<StreamEvent> {
  yield {
    kind: 'meta',
    task: turn.task,
    taskLabel: turn.taskLabel,
    progress: turn.progress,
    supportLevel: turn.supportLevel,
    done: turn.done,
  };
  const parts = turn.reply.split(/(\s+)/).filter((part) => part.length > 0);
  let first = true;
  for (const part of parts) {
    await delay(first ? STREAM_TTFT_MS : STREAM_TOKEN_GAP_MS);
    first = false;
    yield { kind: 'token', text: part };
  }
  yield { kind: 'done', result: turn };
}

const TASK_LABELS: Record<TaskId, string> = {
  0: '온보딩',
  1: '상실의 현실 받아들이기',
  2: '슬픔의 감정 마주하기',
  3: '없는 일상에 적응하기',
  4: '연결을 간직하며 나아가기',
  5: '마무리',
};
const NEXT_TASK: Record<TaskId, TaskId> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 5 };

/** Depth gate — stay on a stage this many turns, cap here, exit early if disengaged. */
const MIN_DEPTH = 3;
const MAX_DEPTH = 5;
const DISENGAGE_EXIT = 2;

// Bilingual detection, mirroring the backend's shared patterns (task-progression.service +
// crisis-pattern). Case-insensitive for the English side; the apostrophe is optional.
const DUNNO =
  /모르겠|기억.*안|말하기 (어|힘)|글쎄|모름|i don['’]?t know|dunno|don['’]?t remember|can['’]?t remember|not sure|no idea|hard to say/i;
const RISK =
  /죽고\s*싶|살기\s*싫|사라지고\s*싶|따라가고\s*싶|kill myself|killing myself|end my life|want to die|suicid|self[-\s]?harm/i;

const SUPPORT_LEVEL_SAFE: SupportLevel = 1;
const SUPPORT_LEVEL_CRISIS: SupportLevel = 3;

/** A substantive answer (vs. "I don't know" or a one-word reply). */
const isEngaged = (text: string): boolean => !DUNNO.test(text) && text.trim().length > 8;

interface MockSession {
  task: TaskId;
  /** User turns spent on the current stage. */
  turnsInStage: number;
  /** Consecutive non-engaged answers on the current stage. */
  disengageStreak: number;
  petName: string;
  language: Locale;
  closed: boolean;
  supportLevel: SupportLevel;
  history: HistoryMessage[];
}
const sessions = new Map<string, MockSession>();

/** Deterministic transcript timestamps: a fixed base advanced one minute per message. */
let messageSeq = 0;
const BASE_TIME_MS = Date.UTC(2026, 0, 1);
const nextTimestamp = (): string => new Date(BASE_TIME_MS + messageSeq++ * 60_000).toISOString();

const record = (session: MockSession, role: 'assistant' | 'user', text: string): void => {
  session.history.push({ role, text, task: session.task, at: nextTimestamp() });
};

/** Last profile seen — lets "continue" (start with no profile) reuse it in the mock. */
let lastGriefProfile: GriefProfile | undefined;

const progressOf = (task: TaskId): number => Math.min(Math.max(task - 1, 0) / 4, 1);

type Line = (pet: string) => string;

interface LineSet {
  intro: Line;
  /** Welcome-back greeting for a resumed journey (new session, inherited stage). */
  resume: (task: TaskId, pet: string) => string;
  open: Record<number, Line>;
  /** Deeper follow-ups per stage (example-guided), indexed by how deep we already are. */
  deepen: Record<number, Line[]>;
  retry: Line;
  closing: string;
  crisis: string;
  defaultPetName: string;
}

const LINES: Record<Locale, LineSet> = {
  ko: {
    intro: (pet) => `${pet} 이야기를 천천히 함께 나눠볼게요. ${(LINES.ko.open[1] as Line)(pet)}`,
    resume: (task, pet) =>
      `다시 와주셨네요. 지난 이야기에 이어서 천천히 함께해요. ${openLine(LINES.ko, task, pet)}`,
    open: {
      1: (pet) =>
        `${pet} 이야기를 들려주실 수 있을까요? 어떻게 헤어지게 되었는지, 편하신 만큼만요. (예: "지난달에 신장병으로 떠났어요"처럼요)`,
      2: (pet) =>
        `${pet}를 떠올릴 때 지금 가장 크게 차오르는 감정은 무엇인가요? (예: 그리움, 미안함, 먹먹함처럼요)`,
      3: (pet) =>
        `${pet}가 없는 일상에서 빈자리가 가장 크게 느껴지는 순간은 언제인가요? (예: 밥 주던 시간, 산책하던 길처럼요)`,
      4: (pet) =>
        `${pet}와의 연결을 어떤 모습으로 마음에 간직하고 싶으세요? (예: 사진첩, 이름을 딴 무언가처럼요)`,
    },
    deepen: {
      1: [
        (pet) =>
          `그날 ${pet}와의 마지막 순간은 어떻게 기억되고 있나요? (예: 곁을 지켰던 장면, 마지막으로 나눈 눈빛처럼요)`,
        (pet) =>
          `${pet}가 "떠났다"는 사실이 아직 실감 나지 않는 순간이 있나요? (예: 문을 열 때 마중 나올 것 같은 느낌처럼요)`,
        () =>
          `그 이별을 떠올릴 때 가장 또렷하게 남아 있는 장면은 무엇인가요? (예: 마지막으로 안아줬던 감촉처럼요)`,
      ],
      2: [
        () => `그 감정은 몸의 어디에서 느껴지나요? (예: 가슴이 답답하다, 목이 메인다처럼요)`,
        (pet) =>
          `그 마음을 ${pet}에게 한마디 건넨다면 어떤 말이 나올까요? (예: "고마웠어", "미안해"처럼요)`,
        () =>
          `그 감정이 하루 중 특히 크게 밀려오는 때가 있나요? (예: 자기 전, 집에 돌아왔을 때처럼요)`,
      ],
      3: [
        () =>
          `그 빈자리의 순간을 요즘은 어떻게 보내고 계세요? (예: 그냥 지나친다, 사진을 본다처럼요)`,
        () =>
          `달라진 일상 중에 그래도 조금 견딜 만해진 부분이 있나요? (예: 아침 루틴, 잠자리처럼요)`,
        (pet) => `하루 중 ${pet} 생각이 잠시 옅어지는 순간도 있나요? (예: 일에 집중할 때처럼요)`,
      ],
      4: [
        (pet) =>
          `${pet}가 남겨준 것 중 계속 간직하고 싶은 건 무엇인가요? (예: 함께한 습관, 배운 마음처럼요)`,
        (pet) =>
          `${pet}를 기억하는 나만의 방법을 하나 떠올린다면요? (예: 기일에 촛불 켜기, 산책로 다시 걷기처럼요)`,
        (pet) =>
          `언젠가 ${pet}를 편안하게 떠올릴 수 있다면 어떤 모습이면 좋겠어요? (예: 웃으며 이야기하기처럼요)`,
      ],
    },
    retry: (pet) =>
      `천천히 하셔도 괜찮아요. 꼭 답하지 않으셔도 돼요. 지금 ${pet}를 떠올리면 마음에 가장 먼저 드는 건 무엇인가요? (예: 한 단어여도 좋아요 — "보고 싶다"처럼요)`,
    closing: '오늘 용기 내어 마음을 나눠주셨어요. 잘 해내셨어요. 다음에 다시 천천히 함께할게요.',
    crisis:
      '지금 많이 힘드신 것 같아요. 혼자 감당하지 않으셔도 돼요. 자살예방 상담전화 109(24시간)로 전문가와 바로 이야기할 수 있어요.',
    defaultPetName: '아이',
  },
  en: {
    intro: (pet) => `Let's gently talk through ${pet} together. ${(LINES.en.open[1] as Line)(pet)}`,
    resume: (task, pet) =>
      `Welcome back. Let's gently pick up where we left off. ${openLine(LINES.en, task, pet)}`,
    open: {
      1: (pet) =>
        `Could you tell me about ${pet}? How you parted — only as much as feels okay. (e.g., "she passed last month from kidney disease")`,
      2: (pet) =>
        `When you think of ${pet} now, what feeling rises most strongly? (e.g., longing, guilt, a heavy ache)`,
      3: (pet) =>
        `When does ${pet}'s absence feel largest in your day? (e.g., feeding time, the old walking route)`,
      4: (pet) =>
        `How would you like to keep your bond with ${pet} in your heart? (e.g., a photo album, something named after them)`,
    },
    deepen: {
      1: [
        (pet) =>
          `How do you remember your last moments with ${pet}? (e.g., staying by their side, a final shared look)`,
        (pet) =>
          `Are there moments when ${pet} being gone still doesn't feel real? (e.g., expecting them at the door)`,
        () =>
          `What scene stays most vivid when you recall the goodbye? (e.g., the feel of a last hug)`,
      ],
      2: [
        () =>
          `Where in your body do you feel that emotion? (e.g., a tight chest, a lump in the throat)`,
        (pet) =>
          `If you could say one thing to ${pet} right now, what would it be? (e.g., "thank you", "I'm sorry")`,
        () => `Is there a time of day that feeling hits hardest? (e.g., before sleep, coming home)`,
      ],
      3: [
        () =>
          `How do you get through that empty moment these days? (e.g., you pass it by, you look at photos)`,
        () =>
          `Is any part of the changed routine a little more bearable now? (e.g., mornings, bedtime)`,
        (pet) =>
          `Are there moments when thoughts of ${pet} ease for a while? (e.g., when you're focused on work)`,
      ],
      4: [
        (pet) =>
          `What do you most want to keep of what ${pet} left you? (e.g., a shared habit, something you learned)`,
        (pet) =>
          `What would be your own way of remembering ${pet}? (e.g., a candle on the anniversary, walking the old path)`,
        (pet) =>
          `If one day you could recall ${pet} with ease, what might that look like? (e.g., smiling as you tell the story)`,
      ],
    },
    retry: (pet) =>
      `There's no rush, and you don't have to answer. When you picture ${pet} right now, what comes to mind first? (e.g., a single word is fine — "I miss you")`,
    closing:
      'Thank you for sharing your heart today. You did well. We can continue slowly, together, next time.',
    crisis:
      "It sounds like you're carrying so much right now. You don't have to face this alone — you can reach the 988 Suicide & Crisis Lifeline (24/7) to talk with someone right away.",
    defaultPetName: 'your friend',
  },
};

const openLine = (lines: LineSet, task: TaskId, pet: string): string =>
  (lines.open[task] ?? (lines.open[1] as Line))(pet);

const deepenLine = (lines: LineSet, task: TaskId, pet: string, depth: number): string => {
  const list = lines.deepen[task] ?? lines.deepen[1] ?? [];
  const index = Math.min(Math.max(depth - 1, 0), list.length - 1);
  const line = list[index] ?? list[0];
  return line ? line(pet) : '';
};

export const mockApi: Api = {
  async start(request: StartRequest): Promise<TurnResult> {
    // First-time onboarding sends a profile; omitting it resumes the journey
    // from the most recent session (inherited profile + reached stage).
    const prior = [...sessions.values()].pop();
    const resuming = !request.griefProfile && prior !== undefined;
    const griefProfile = request.griefProfile ?? lastGriefProfile ?? { griefPath: 'afterLoss' };
    lastGriefProfile = griefProfile;
    const language = resuming
      ? prior.language
      : (griefProfile.preferredLanguage ?? DEFAULT_PREFERRED_LANGUAGE);
    const lines = LINES[language] ?? LINES[DEFAULT_LOCALE];
    const petName = resuming ? prior.petName : (griefProfile.petName ?? lines.defaultPetName);
    // A completed arc starts a fresh pass; otherwise resume at the reached stage.
    const task: TaskId = resuming && prior.task < 5 ? prior.task : 1;
    const session: MockSession = {
      task,
      turnsInStage: 0,
      disengageStreak: 0,
      petName,
      language,
      closed: false,
      supportLevel: SUPPORT_LEVEL_SAFE,
      history: [],
    };
    sessions.set(request.sessionId, session);
    const reply = resuming ? lines.resume(task, petName) : lines.intro(petName);
    record(session, 'assistant', reply);
    return {
      reply,
      task,
      taskLabel: TASK_LABELS[task],
      progress: progressOf(task),
      supportLevel: SUPPORT_LEVEL_SAFE,
      done: false,
    };
  },

  async sendMessage(sessionId: string, text: string): Promise<TurnResult> {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.closed) {
      throw new Error('Session is already closed.');
    }
    const lines = LINES[session.language] ?? LINES[DEFAULT_LOCALE];
    record(session, 'user', text);

    // Safety first: a crisis signal routes to professional help, then closes.
    if (RISK.test(text)) {
      session.closed = true;
      session.supportLevel = SUPPORT_LEVEL_CRISIS;
      record(session, 'assistant', lines.crisis);
      return {
        reply: lines.crisis,
        task: session.task,
        taskLabel: TASK_LABELS[session.task],
        progress: progressOf(session.task),
        supportLevel: SUPPORT_LEVEL_CRISIS,
        done: true,
      };
    }

    // Deterministic depth gate (mirrors TaskProgressionService).
    const engaged = isEngaged(text);
    session.turnsInStage += 1;
    session.disengageStreak = engaged ? 0 : session.disengageStreak + 1;
    const advance =
      (session.turnsInStage >= MIN_DEPTH && engaged) ||
      session.disengageStreak >= DISENGAGE_EXIT ||
      session.turnsInStage >= MAX_DEPTH;

    if (advance) {
      session.task = NEXT_TASK[session.task];
      session.turnsInStage = 0;
      session.disengageStreak = 0;
    }

    // Finishing task 4 (task becomes 5) closes the session.
    if (session.task >= 5) {
      session.closed = true;
      record(session, 'assistant', lines.closing);
      return {
        reply: lines.closing,
        task: 5,
        taskLabel: TASK_LABELS[5],
        progress: 1,
        supportLevel: SUPPORT_LEVEL_SAFE,
        done: true,
      };
    }

    // Open a new stage, deepen the current one, or gently re-ask.
    const reply = advance
      ? openLine(lines, session.task, session.petName)
      : engaged
        ? deepenLine(lines, session.task, session.petName, session.turnsInStage)
        : lines.retry(session.petName);
    record(session, 'assistant', reply);

    return {
      reply,
      task: session.task,
      taskLabel: TASK_LABELS[session.task],
      progress: progressOf(session.task),
      supportLevel: SUPPORT_LEVEL_SAFE,
      done: false,
    };
  },

  async *startStream(request: StartRequest): AsyncIterable<StreamEvent> {
    yield* streamTurn(await this.start(request));
  },

  async *sendMessageStream(sessionId: string, text: string): AsyncIterable<StreamEvent> {
    yield* streamTurn(await this.sendMessage(sessionId, text));
  },

  async listSessions(): Promise<SessionListItem[]> {
    return [...sessions.entries()].reverse().map(([sessionId, session]) => ({
      sessionId,
      closed: session.closed,
      reachedTask: session.task,
      taskLabel: TASK_LABELS[session.task],
      progress: progressOf(session.task),
      petName: session.petName,
      preferredLanguage: session.language,
      reportAvailable: reportAvailable(session),
    }));
  },

  async getSessionState(sessionId: string): Promise<SessionStateView> {
    return stateOf(sessionId, requireSession(sessionId));
  },

  async getMessages(sessionId: string): Promise<HistoryMessage[]> {
    return [...requireSession(sessionId).history];
  },

  async getReport(sessionId: string): Promise<MindReport> {
    const session = requireSession(sessionId);
    if (!reportAvailable(session)) {
      throw new Error('The report is not available for this session yet.');
    }
    const titles = REPORT_TITLES[session.language] ?? REPORT_TITLES[DEFAULT_LOCALE];
    const bodies = reportBodies(session);
    return {
      at: nextTimestamp(),
      petName: session.petName,
      reachedTask: session.task,
      progress: progressOf(session.task),
      locale: session.language,
      sections: REPORT_ORDER.map((key) => ({ key, title: titles[key], body: bodies[key] })),
    };
  },

  async closeSession(sessionId: string): Promise<SessionStateView> {
    const session = requireSession(sessionId);
    session.closed = true;
    return stateOf(sessionId, session);
  },
};

const requireSession = (sessionId: string): MockSession => {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  return session;
};

/** Mirrors the backend rule: wrapped up with at least one completed stage. */
const REPORT_MIN_TASK: TaskId = 2;
const reportAvailable = (session: MockSession): boolean =>
  session.closed && session.task >= REPORT_MIN_TASK;

const stateOf = (sessionId: string, session: MockSession): SessionStateView => ({
  sessionId,
  task: session.task,
  taskLabel: TASK_LABELS[session.task],
  progress: progressOf(session.task),
  supportLevel: session.supportLevel,
  closed: session.closed,
  reportAvailable: reportAvailable(session),
});

const REPORT_ORDER: ReportSectionKey[] = ['journey', 'emotions', 'keepsake', 'encouragement'];

const REPORT_TITLES: Record<Locale, Record<ReportSectionKey, string>> = {
  ko: {
    journey: '함께 걸어온 길',
    emotions: '마음에 담긴 감정',
    keepsake: '기억하고 싶은 것',
    encouragement: '다독임 한마디',
  },
  en: {
    journey: 'The path you walked',
    emotions: 'What your heart carried',
    keepsake: 'A keepsake to hold',
    encouragement: 'A word for you',
  },
};

/** Deterministic report bodies — mock content standing in for the model's writing. */
function reportBodies(session: MockSession): Record<ReportSectionKey, string> {
  const pet = session.petName;
  const percent = Math.round(progressOf(session.task) * 100);
  if (session.language === 'en') {
    return {
      journey: `Today you walked ${percent}% of the grief journey with ${pet}'s story, gently and at your own pace.`,
      emotions: `Whatever rose in your heart today, it came from loving ${pet} — every bit of it is natural.`,
      keepsake: `The moments you shared about ${pet} are worth keeping. Hold today's memory softly.`,
      encouragement: `Thank you for your courage in sharing today. You did more than enough.`,
    };
  }
  return {
    journey: `오늘 ${pet}의 이야기와 함께 애도의 길을 ${percent}%만큼, 당신의 속도로 걸었어요.`,
    emotions: `오늘 마음에 차올랐던 감정은 모두 ${pet}를 사랑했기에 드는 자연스러운 마음이에요.`,
    keepsake: `${pet}에 대해 나눠주신 순간들은 간직할 가치가 있어요. 오늘의 기억을 부드럽게 담아두세요.`,
    encouragement: `오늘 용기 내어 마음을 나눠주셔서 고마워요. 충분히 잘 해내셨어요.`,
  };
}
