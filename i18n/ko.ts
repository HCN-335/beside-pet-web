/**
 * i18n/ko.ts — Korean catalog (the default locale).
 * UI chrome and the onboarding script live here. Counselor replies are NOT
 * here: they are content produced by the backend/LLM in the user's language.
 */
import type { Messages } from './messages';

export const ko: Messages = {
  landing: {
    title: 'Beside Pet 🐾',
    subtitleLine1: '반려동물을 떠나보낸 당신 곁에서,',
    subtitleLine2: '천천히 함께 이야기를 나눠요.',
    start: '시작하기',
  },
  auth: {
    title: '로그인',
    subtitle: '계속하려면 로그인해 주세요.',
    username: '아이디',
    password: '비밀번호',
    submit: '로그인',
    signingIn: '로그인 중…',
    logout: '로그아웃',
    setupTitle: '최초 관리자 설정',
    setupSubtitle: '아직 관리자 계정이 없어요. 설정 토큰으로 첫 관리자 계정을 만들어 주세요.',
    setupToken: '설정 토큰',
    setupTokenHint: '서버 시작 로그에 한 번 출력된 토큰이에요.',
    setupSubmit: '관리자 계정 만들기',
    settingUp: '만드는 중…',
  },
  chat: {
    placeholder: '마음을 들려주세요…',
    send: '보내기',
    skip: '잘 모르겠어요',
  },
  onboarding: {
    askName:
      '안녕하세요. 곁을 지키는 동반자, 마음이예요. 어떤 이야기든 천천히 함께할게요. 먼저, 떠나보낸 아이의 이름을 알려주실 수 있을까요?',
    askLanguage: '어떤 언어로 대화를 나누면 좋을까요? 상담에만 쓰이는 설정이에요.',
    askDuration: (petName) => `${petName}와는 얼마나 오래 함께했나요?`,
    askLoss: (petName) => `${petName}와 어떻게 이별하게 되셨는지, 편하신 만큼만 알려주세요.`,
    askSituation: (petName) => `지금 ${petName}는 어떤 상황인가요?`,
    askPath: (petName) => `지금 ${petName}는 이미 곁을 떠났을까요, 아니면 아직 함께 있을까요?`,
    askSleep: '요즘 잠은 좀 주무시나요? 무리해서 답하지 않으셔도 괜찮아요.',
    closing: '들려주셔서 고마워요. 이제 천천히 이야기를 시작해볼게요.',
    placeholderName: '아이의 이름을 적어 주세요',
    begin: '이야기 시작하기',
    defaultPetName: '아이',
    duration: { '0-3': '0~3년', '4-7': '4~7년', '8-11': '8~11년', '12+': '12년 이상' },
    loss: {
      sudden: '사고',
      illness: '병환',
      natural: '노환',
      euthanasia: '안락사',
      unknown: '기타',
    },
    situation: { aging: '노령', endOfLife: '말기 질환', ongoingCare: '투병 중', other: '기타' },
    path: { afterLoss: '이미 곁을 떠났어요', beforeLoss: '아직 함께 있어요' },
    sleep: { ok: '잘 자는 편이에요', fair: '그저 그래요', disturbed: '잘 못 자요' },
  },
  session: {
    noSession: '진행 중인 세션이 없어요.',
    toHome: '처음으로',
    closed: '오늘 세션을 마무리했어요. 언제든 다시 찾아와 주세요.',
    progressFallback: '상담 준비',
  },
  sessionList: {
    title: '다시 오셨네요',
    subtitle: '지난 이야기에 이어서 함께할 수 있어요.',
    continueButton: '이어서 상담하기',
    newButton: '새 대화 시작',
    ongoing: '진행 중',
    done: '마무리됨',
    loading: '불러오는 중…',
  },
  safety: {
    title: '지금 많이 힘드시다면, 혼자가 아니에요.',
    body: '자살예방 상담전화 109 (24시간) · 정신건강 상담전화 1577-0199 로 전문가와 바로 이야기할 수 있어요.',
    hotlineNumber: '109',
  },
};
