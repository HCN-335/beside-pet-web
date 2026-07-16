/**
 * i18n/en.ts — English catalog.
 * Same shape as the Korean default; counselor replies are not here (the backend
 * produces them in the user's language).
 */
import type { Messages } from './messages';

export const en: Messages = {
  landing: {
    title: 'Beside Pet 🐾',
    subtitleLine1: 'Beside you, after losing your companion —',
    subtitleLine2: "let's talk it through, slowly, together.",
    start: 'Get started',
  },
  auth: {
    title: 'Sign in',
    subtitle: 'Please sign in to continue.',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    signingIn: 'Signing in…',
    logout: 'Sign out',
    setupTitle: 'First-run admin setup',
    setupSubtitle: 'No admin account exists yet. Create the first one with the setup token.',
    setupToken: 'Setup token',
    setupTokenHint: 'Printed once in the server boot log.',
    setupSubmit: 'Create admin account',
    settingUp: 'Creating…',
  },
  chat: {
    placeholder: 'Share what is on your mind…',
    send: 'Send',
    skip: 'I am not sure',
  },
  onboarding: {
    askName:
      'Hello. I am Maeumi, a companion here beside you. We can take all of this slowly. First, may I ask the name of the friend you have lost?',
    askLanguage:
      'Which language would you like us to talk in? You can change nothing else — this is just for our conversation.',
    askDuration: (petName) => `How long were you and ${petName} together?`,
    askLoss: (petName) => `How did you and ${petName} part? Share only as much as feels okay.`,
    askSituation: (petName) => `What is ${petName} going through right now?`,
    askPath: (petName) => `Right now, has ${petName} already passed, or are they still with you?`,
    askSleep: 'Have you been able to sleep lately? There is no need to push yourself to answer.',
    closing: 'Thank you for sharing. Let us begin, slowly.',
    placeholderName: "Type your friend's name",
    begin: 'Start the conversation',
    defaultPetName: 'your friend',
    duration: { '0-3': '0–3 years', '4-7': '4–7 years', '8-11': '8–11 years', '12+': '12+ years' },
    loss: {
      sudden: 'Accident',
      illness: 'Illness',
      natural: 'Old age',
      euthanasia: 'Euthanasia',
      unknown: 'Other',
    },
    situation: {
      aging: 'Old age',
      endOfLife: 'Terminal illness',
      ongoingCare: 'In treatment',
      other: 'Other',
    },
    path: { afterLoss: 'They have already passed', beforeLoss: 'They are still with me' },
    sleep: { ok: 'I sleep okay', fair: 'So-so', disturbed: 'I barely sleep' },
  },
  session: {
    noSession: 'There is no session in progress.',
    toHome: 'Back to start',
    closed: 'We have wrapped up today’s session. Come back anytime.',
    progressFallback: 'Getting ready',
  },
  sessionList: {
    title: 'Welcome back',
    subtitle: 'We can pick up gently where we left off.',
    continueButton: 'Continue talking',
    newButton: 'Start a new conversation',
    ongoing: 'In progress',
    done: 'Completed',
    loading: 'Loading…',
  },
  safety: {
    title: 'If things feel heavy right now, you are not alone.',
    body: 'You can talk to a counselor right away — call 109 (24h), or the multilingual Danuri Helpline at 1577-1366.',
    hotlineNumber: '109',
  },
};
