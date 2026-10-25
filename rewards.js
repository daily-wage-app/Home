import {
  auth, db, collection, doc, getDoc, getDocs, increment, onAuthStateChanged,
  query, runTransaction, serverTimestamp, where
} from './firebase.js';
import { getLanguage, t } from './i18n.js';

const POINTS_PER_BAHT = 100;
const MIN_WITHDRAWAL_BAHT = 10;
const DAILY_CHECKIN_POINTS = 100;
const SEVENTH_DAY_POINTS = 400;
const SEVENTH_DAY_SPECIAL_BONUS = SEVENTH_DAY_POINTS - DAILY_CHECKIN_POINTS;
const REFERRAL_BONUS_POINTS = 100;
const FREE_PASS_COOLDOWN_DAYS = 30;
const FREE_PASS_COOLDOWN_MS = FREE_PASS_COOLDOWN_DAYS * 86400000;
const CHECKIN_CYCLE_DAYS = 7;
const WITHDRAWAL_CONSENT_VERSION = 1;
const TIME_ZONE = 'Asia/Bangkok';
const DEVICE_ID_STORAGE_KEY = 'dailyWageDeviceId';
const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const pointBalance = document.getElementById('rewardPointBalance');
const bahtEquivalent = document.getElementById('rewardBahtEquivalent');
const streakValue = document.getElementById('rewardStreak');
const checkinMessage = document.getElementById('checkinMessage');
const checkinButton = document.getElementById('dailyCheckinButton');
const withdrawButton = document.getElementById('openWithdrawalButton');
const rewardNotice = document.getElementById('rewardNotice');
const historyList = document.getElementById('withdrawalHistory');
const withdrawalDialog = document.getElementById('withdrawalDialog');
const withdrawalForm = document.getElementById('withdrawalForm');
const withdrawalError = document.getElementById('withdrawalError');
const withdrawalAmount = document.getElementById('withdrawalAmount');
const withdrawalPoints = document.getElementById('withdrawalPoints');
const walletNameInput = document.getElementById('walletAccountName');
const walletNumberInput = document.getElementById('walletAccountNumber');
const withdrawalConsent = document.getElementById('withdrawalConsent');
const closeWithdrawalButton = document.getElementById('closeWithdrawalButton');
const cancelWithdrawalButton = document.getElementById('cancelWithdrawalButton');
const submitWithdrawalButton = document.getElementById('submitWithdrawalButton');
const rewardLadder = document.getElementById('rewardLadder');
const freePassStatus = document.getElementById('freePassStatus');
const freePassDescription = document.getElementById('freePassDescription');
const achievementBadges = document.getElementById('achievementBadges');
const referralCount = document.getElementById('referralCount');
const shareReferralButton = document.getElementById('shareReferralButton');
const rewardSoundToggle = document.getElementById('rewardSoundToggle');
const rewardCelebration = document.getElementById('rewardCelebration');

let currentUser = null;
let currentWallet = null;
let isBusy = false;
let installationId = null;
let deviceClaimedByAnotherUser = false;
let qualifiedReferralCount = 0;
const SOUND_STORAGE_KEY = 'dailyWageRewardSound';

function bangkokDayKey(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function bangkokDayNumber(date = new Date()) {
  return Date.parse(`${bangkokDayKey(date)}T00:00:00.000Z`);
}

function getOrCreateInstallationId() {
  const stored = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (stored && DEVICE_ID_PATTERN.test(stored)) return stored;
  if (typeof window.crypto?.randomUUID !== 'function') {
    throw new Error('Secure random UUID is unavailable');
  }
  const created = window.crypto.randomUUID().toLowerCase();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
  if (window.localStorage.getItem(DEVICE_ID_STORAGE_KEY) !== created) {
    throw new Error('Device identifier could not be persisted');
  }
  return created;
}

try {
  installationId = getOrCreateInstallationId();
} catch (error) {
  installationId = null;
}

function deviceClaimRef() {
  return doc(db, 'deviceCheckInClaims', installationId);
}

function dayDifference(newer, older) {
  const newerDay = Date.parse(`${bangkokDayKey(newer)}T00:00:00Z`);
  const olderDay = Date.parse(`${bangkokDayKey(older)}T00:00:00Z`);
  return Math.round((newerDay - olderDay) / 86400000);
}

function asDate(timestamp) {
  return timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : null;
}

function displayDate(timestamp) {
  const date = asDate(timestamp);
  if (!date) return '—';
  return new Intl.DateTimeFormat(getLanguage() === 'en' ? 'en-US' : 'my-MM', {
    timeZone: TIME_ZONE, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function statusLabel(status) {
  const label = ({
    pending: 'တောင်းဆိုမှု လက်ခံရရှိပြီး',
    processing: 'စစ်ဆေးနေဆဲ',
    paid: 'ငွေလွှဲပြီး',
    rejected: 'ပယ်ဖျက်ပြီး · အမှတ်ပြန်အမ်းပြီး'
  })[status] || 'အခြေအနေ မသိရပါ';
  return t(label);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function showNotice(message, type = 'info') {
  rewardNotice.dataset.sourceMessage = message;
  rewardNotice.textContent = t(message);
  rewardNotice.dataset.type = type;
  rewardNotice.hidden = !message;
}

function localizedNumber(value) {
  return Number(value || 0).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM');
}

function isRewardSoundEnabled() {
  try { return localStorage.getItem(SOUND_STORAGE_KEY) === 'on'; }
  catch (error) { return false; }
}

function renderRewardLadder() {
  const todayChecked = isCheckedInToday();
  const streak = Number(currentWallet?.streakCount || 0);
  const completedCycles = Number(currentWallet?.completedSevenDayCycles || 0);
  const visibleDay = todayChecked ? (streak || (completedCycles ? 7 : 1)) : Math.min(streak + 1, CHECKIN_CYCLE_DAYS);
  rewardLadder.innerHTML = Array.from({ length: CHECKIN_CYCLE_DAYS }, (_, index) => {
    const day = index + 1;
    const points = day === CHECKIN_CYCLE_DAYS ? SEVENTH_DAY_POINTS : DAILY_CHECKIN_POINTS;
    const classes = [
      'reward-step',
      day < visibleDay || (todayChecked && day === visibleDay) ? 'is-complete' : '',
      day === visibleDay && !todayChecked ? 'is-current' : ''
    ].filter(Boolean).join(' ');
    return `<div class="${classes}" aria-label="${escapeHtml(t('ရက် {day}', { day: localizedNumber(day) }))}: ${escapeHtml(t('{points} မှတ်', { points: localizedNumber(points) }))}"><b>${escapeHtml(t('ရက် {day}', { day: localizedNumber(day) }))}</b><span>${escapeHtml(t('{points} မှတ်', { points: localizedNumber(points) }))}</span></div>`;
  }).join('');
}

function renderFreePass() {
  const lastUsed = asDate(currentWallet?.lastFreePassAt);
  const available = !lastUsed || Date.now() - lastUsed.getTime() >= FREE_PASS_COOLDOWN_MS;
  const nextUse = lastUsed ? new Date(lastUsed.getTime() + FREE_PASS_COOLDOWN_MS) : null;
  const dateText = nextUse
    ? new Intl.DateTimeFormat(getLanguage() === 'en' ? 'en-US' : 'my-MM', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' }).format(nextUse)
    : '';
  const gap = currentWallet?.lastCheckInAt ? dayDifference(new Date(), asDate(currentWallet.lastCheckInAt)) : 0;
  freePassStatus.textContent = !currentWallet ? '—' : available ? t('အသင့်ရှိ') : dateText;
  freePassDescription.textContent = available
    ? gap === 2
      ? t('ဒီနေ့ဝင်ရောက်ပါက Free Pass သုံး၍ ရက်ဆက်မှုကို ထိန်းပေးမည်')
      : t('ရက် ၃၀ တစ်ကြိမ် · တစ်ရက်လွတ်လျှင် streak ကို ထိန်းပေးမည်')
    : t('နောက်တစ်ကြိမ် ရနိုင်မည့်ရက်: {date}', { date: dateText });
}

function renderBadges() {
  const total = Number(currentWallet?.totalCheckIns || 0);
  const streak = Number(currentWallet?.streakCount || 0);
  const cycles = Number(currentWallet?.completedSevenDayCycles || 0);
  const badges = [
    { icon: '🌱', title: 'ပထမဆုံး check-in', detail: 'ပထမနေ့ကို ပြီးမြောက်စေပါ', earned: total >= 1 },
    { icon: '🔥', title: '၅ ရက်ဆက်တိုက်', detail: 'ရက် ၅ ရက်အထိ မပျက်မကွက်', earned: streak >= 5 || cycles > 0 },
    { icon: '🏅', title: '၇ ရက်အောင်မြင်သူ', detail: 'ဆု ၁,၀၀၀ မှတ် ပြည့်မီပါ', earned: cycles > 0 },
    { icon: '💪', title: 'check-in ၃၀ ကြိမ်', detail: 'စုစုပေါင်း ရက် ၃၀ ဝင်ပါ', earned: total >= 30 },
    { icon: '🤝', title: 'မိတ်ဆွေဖိတ်ခေါ်သူ', detail: 'မိတ်ဆွေ ၇ ရက်ပြည့်ပါ', earned: qualifiedReferralCount > 0 },
    { icon: '⏱️', title: 'အချိန်မှန်အလုပ်သမား', detail: 'အတည်ပြုထားသော အလုပ်မှတ်တမ်းလိုသည်', earned: false },
    { icon: '🏆', title: 'Top Earner', detail: 'အတည်ပြုထားသော လုပ်အားခဒေတာလိုသည်', earned: false }
  ];
  achievementBadges.innerHTML = badges.map(badge => `<div class="achievement-badge${badge.earned ? ' is-earned' : ''}" title="${escapeHtml(t(badge.detail))}"><span class="badge-icon" aria-hidden="true">${badge.icon}</span><strong>${escapeHtml(t(badge.title))}</strong><small>${escapeHtml(t(badge.earned ? 'ရရှိပြီး' : badge.detail))}</small></div>`).join('');
}

async function refreshReferralCount() {
  if (!currentUser) {
    qualifiedReferralCount = 0;
    renderBadges();
    return;
  }
  const userId = currentUser.uid;
  try {
    const snapshot = await getDocs(query(collection(db, 'referralClaims'), where('inviterUid', '==', userId), where('status', '==', 'awarded')));
    if (currentUser?.uid !== userId) return;
    qualifiedReferralCount = snapshot.size;
  } catch (error) {
    qualifiedReferralCount = 0;
  }
  referralCount.textContent = t('{count} ဦး မိတ်ဆွေ ၇ ရက် check-in ပြည့် · {points} မှတ် ရရှိပြီး', {
    count: localizedNumber(qualifiedReferralCount), points: localizedNumber(qualifiedReferralCount * REFERRAL_BONUS_POINTS)
  });
  renderBadges();
}

async function shareReferralLink() {
  if (!currentUser) return;
  const inviteUrl = new URL(window.location.href);
  inviteUrl.search = '';
  inviteUrl.hash = '';
  inviteUrl.searchParams.set('ref', currentUser.uid);
  const shareData = {
    title: 'Daily Wage',
    text: t('Daily Wage တွင် မိတ်ဆွေအဖြစ် join လုပ်ပါ။ ကျွန်ုပ်တို့နှစ်ဦးစလုံး ၇ ရက် check-in ပြည့်ပါက ၁၀၀ မှတ်စီ ရပါမည်။'),
    url: inviteUrl.toString()
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(inviteUrl.toString());
      showNotice(t('ဖိတ်ခေါ်လင့်ခ်ကို ကူးယူပြီးပါပြီ။'), 'success');
    } else {
      throw new Error('Sharing is unavailable');
    }
  } catch (error) {
    if (error?.name !== 'AbortError') showNotice(t('ဖိတ်ခေါ်လင့်ခ် မပို့နိုင်ပါ။ လင့်ခ်ကို ပြန်စမ်းပါ။'), 'error');
  }
}

function celebrateReward() {
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    const colors = ['#b8f2d1', '#79dcff', '#ffdf70', '#ffffff', '#ff91c8'];
    const pieces = Array.from({ length: 42 }, () => {
      const piece = document.createElement('i');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--drift', `${Math.round((Math.random() - .5) * 220)}px`);
      piece.style.animationDelay = `${Math.random() * .32}s`;
      rewardCelebration.append(piece);
      window.setTimeout(() => piece.remove(), 2400);
      return piece;
    });
    if (!pieces.length) return;
  }
  if (!isRewardSoundEnabled()) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [660, 880, 1100].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, context.currentTime + index * .1);
      gain.gain.exponentialRampToValueAtTime(.08, context.currentTime + index * .1 + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + index * .1 + .18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * .1);
      oscillator.stop(context.currentTime + index * .1 + .2);
    });
    window.setTimeout(() => context.close(), 600);
  } catch (error) {
    // Some mobile browsers require a separate user gesture before sound is available.
  }
}

function renderRewardExtras() {
  renderRewardLadder();
  renderFreePass();
  renderBadges();
  shareReferralButton.disabled = !currentUser || !currentWallet;
  referralCount.textContent = t('{count} ဦး မိတ်ဆွေ ၇ ရက် check-in ပြည့် · {points} မှတ် ရရှိပြီး', {
    count: localizedNumber(qualifiedReferralCount), points: localizedNumber(qualifiedReferralCount * REFERRAL_BONUS_POINTS)
  });
  rewardSoundToggle.setAttribute('aria-pressed', String(isRewardSoundEnabled()));
  rewardSoundToggle.textContent = t(isRewardSoundEnabled() ? 'အသံဖွင့်ထားသည်' : 'အသံပိတ်ထားသည်');
}

function setWithdrawalError(message) {
  withdrawalError.dataset.sourceMessage = message;
  withdrawalError.textContent = t(message);
  withdrawalError.hidden = !message;
}

function setBusy(value) {
  isBusy = value;
  checkinButton.disabled = value || !currentWallet || isCheckedInToday() || deviceClaimedByAnotherUser || !installationId;
  withdrawButton.disabled = value || !currentWallet || currentWallet.pointsBalance < MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT || withdrewToday();
  submitWithdrawalButton.disabled = value;
}

function isCheckedInToday() {
  const last = asDate(currentWallet?.lastCheckInAt);
  return Boolean(last && bangkokDayKey(last) === bangkokDayKey(new Date()));
}

function withdrewToday() {
  const last = asDate(currentWallet?.lastWithdrawalAt);
  return Boolean(last && bangkokDayKey(last) === bangkokDayKey(new Date()));
}

function renderWallet() {
  if (!currentWallet) {
    pointBalance.textContent = '—';
    bahtEquivalent.textContent = t('ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးမှ အမှတ်များ ပြသပါမည်');
    streakValue.textContent = '0 / 7';
    checkinMessage.textContent = t('ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ထပ်မံဝင်ရောက်ပါ။');
    checkinButton.disabled = true;
    withdrawButton.disabled = true;
    renderRewardExtras();
    return;
  }

  const points = Number(currentWallet.pointsBalance || 0);
  const streak = Number(currentWallet.streakCount || 0);
  pointBalance.textContent = points.toLocaleString('en-US');
  bahtEquivalent.textContent = t('{baht} ဘတ်တန်ဖိုး', { baht: (points / POINTS_PER_BAHT).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM') });
  streakValue.textContent = `${streak} / ${CHECKIN_CYCLE_DAYS}`;
  document.getElementById('rewardProgressFill').style.width = `${Math.min(100, (streak / CHECKIN_CYCLE_DAYS) * 100)}%`;

  if (isCheckedInToday()) {
      checkinMessage.textContent = t('ဒီနေ့ဝင်ရောက်မှု မှတ်တမ်းတင်ပြီးပါပြီ။ နောက်တစ်ကြိမ်ကို ဘန်ကောက်စံတော်ချိန်အရ မနက်ဖြန်မှ ပြုလုပ်နိုင်ပါမည်။');
  } else if (deviceClaimedByAnotherUser) {
    checkinMessage.textContent = t('ဒီနေ့ ဤဖုန်း/browser မှ ဝင်ရောက်မှုကို အခြားအကောင့်ဖြင့် ရယူပြီးပါပြီ။ မနက်ဖြန်မှ ပြန်ဝင်နိုင်ပါမည်။');
  } else if (!installationId) {
    checkinMessage.textContent = t('ဤ browser တွင် လုံခြုံသောစက် ID ကို သိမ်းမရပါ။ စက်၏ storage ကို ဖွင့်ပြီး ပြန်စမ်းပါ။');
  } else {
    checkinMessage.textContent = t('တစ်နေ့တစ်ကြိမ် ဝင်ရောက်ပါ။ ယနေ့ဝင်ရောက်လျှင် {points} မှတ်ရမည်။ {days} ရက်မြောက်တွင် ၄၀၀ မှတ်ရရှိပြီး တစ်ပတ်စုစုပေါင်း ၁,၀၀၀ မှတ်ဖြစ်သည်။', {
      days: CHECKIN_CYCLE_DAYS.toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM'),
      points: localizedNumber(streak + 1 === CHECKIN_CYCLE_DAYS ? SEVENTH_DAY_POINTS : DAILY_CHECKIN_POINTS)
    });
  }
  checkinButton.disabled = isBusy || isCheckedInToday() || deviceClaimedByAnotherUser || !currentUser || !installationId;
  withdrawButton.disabled = isBusy || withdrewToday() || points < MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT || !currentUser;
  renderRewardExtras();
}

async function renderHistory() {
  const user = currentUser;
  if (!user) {
    historyList.innerHTML = `<p class="reward-empty">${t('ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ကြည့်နိုင်ပါသည်။')}</p>`;
    return;
  }
  try {
    const result = await getDocs(query(
      collection(db, 'withdrawalRequests'),
      where('uid', '==', user.uid)
    ));
    if (currentUser?.uid !== user.uid) return;
    const entries = result.docs.map(item => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    if (!entries.length) {
      historyList.innerHTML = `<p class="reward-empty">${t('ယခုအချိန်တွင် ငွေထုတ်တောင်းဆိုမှု မရှိသေးပါ။')}</p>`;
      return;
    }
    historyList.innerHTML = entries.map(entry => {
      const digits = String(entry.walletAccountNumber || '');
      const masked = digits ? `•••• ${digits.slice(-4)}` : '—';
      const statusClass = ['pending', 'processing', 'paid', 'rejected'].includes(entry.status) ? entry.status : 'unknown';
      return `<article class="withdrawal-history-item">
        <div class="withdrawal-history-top"><strong>${t('{amount} ဘတ်', { amount: Number(entry.amountBaht || 0).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM') })}</strong><span class="withdrawal-status ${statusClass}">${statusLabel(entry.status)}</span></div>
        <div class="withdrawal-history-meta">${t('TrueMoney ပိုက်ဆံအိတ်')} · ${masked} · ${displayDate(entry.createdAt)}</div>
        <div class="withdrawal-history-points">${t('{points} မှတ်', { points: Number(entry.pointsRequested || 0).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM') })}</div>
        ${entry.adminNote ? `<div class="withdrawal-history-note">${t('စီမံခန့်ခွဲသူ၏ မှတ်ချက်:')} ${escapeHtml(entry.adminNote)}</div>` : ''}
      </article>`;
    }).join('');
  } catch (error) {
    historyList.innerHTML = `<p class="reward-empty">${t('မှတ်တမ်းကို ယခုဖတ်မရပါ။ စာမျက်နှာကို ပြန်ဖွင့်ပါ။')}</p>`;
  }
}

async function awardInviteeReferral(user) {
  if (!user) return false;
  const walletRef = doc(db, 'rewardWallets', user.uid);
  const claimRef = doc(db, 'referralClaims', user.uid);
  try {
    return await runTransaction(db, async transaction => {
      const [walletSnapshot, claimSnapshot] = await Promise.all([
        transaction.get(walletRef), transaction.get(claimRef)
      ]);
      if (!walletSnapshot.exists() || !claimSnapshot.exists() || claimSnapshot.data().status !== 'pending') return false;
      const wallet = walletSnapshot.data();
      if (Number(wallet.completedSevenDayCycles || 0) < 1 || !wallet.lastSevenDayCycleAt) return false;
      const timestamp = serverTimestamp();
      transaction.update(walletRef, {
        pointsBalance: increment(REFERRAL_BONUS_POINTS),
        updatedAt: timestamp
      });
      transaction.update(claimRef, { status: 'invitee_awarded', updatedAt: timestamp, awardedAt: timestamp });
      return true;
    });
  } catch (error) {
    // Leave an eligible claim pending for the next bootstrap if the network is unavailable.
    return false;
  }
}

async function claimPendingReferralBonuses(user) {
  if (!user) return 0;
  let claimed = 0;
  try {
    const pending = await getDocs(query(
      collection(db, 'referralClaims'),
      where('inviterUid', '==', user.uid),
      where('status', '==', 'invitee_awarded')
    ));
    for (const referralDoc of pending.docs) {
      const claimRef = doc(db, 'referralClaims', referralDoc.id);
      const walletRef = doc(db, 'rewardWallets', user.uid);
      const didClaim = await runTransaction(db, async transaction => {
        const [walletSnapshot, claimSnapshot] = await Promise.all([
          transaction.get(walletRef), transaction.get(claimRef)
        ]);
        if (!walletSnapshot.exists() || !claimSnapshot.exists() || claimSnapshot.data().status !== 'invitee_awarded') return false;
        const timestamp = serverTimestamp();
        transaction.update(walletRef, {
          pointsBalance: increment(REFERRAL_BONUS_POINTS),
          lastReferralClaimId: referralDoc.id,
          lastReferralClaimAt: timestamp,
          updatedAt: timestamp
        });
        transaction.update(claimRef, { status: 'awarded', updatedAt: timestamp, awardedAt: timestamp });
        return true;
      });
      if (didClaim) claimed += 1;
    }
  } catch (error) {
    // A denied/read-failed referral stays pending and can be retried next time.
  }
  return claimed;
}

async function ensureReferralClaim(user) {
  if (!user) return;
  const profileRef = doc(db, 'userProfiles', user.uid);
  const referralRef = doc(db, 'referralClaims', user.uid);
  try {
    await runTransaction(db, async transaction => {
      const [profileSnapshot, referralSnapshot] = await Promise.all([
        transaction.get(profileRef), transaction.get(referralRef)
      ]);
      if (!profileSnapshot.exists() || referralSnapshot.exists()) return;
      const inviterUid = profileSnapshot.data().referredByUid || '';
      if (!inviterUid) return;
      const timestamp = serverTimestamp();
      transaction.set(referralRef, {
        inviteeUid: user.uid, inviterUid, status: 'pending', rewardPoints: REFERRAL_BONUS_POINTS,
        createdAt: timestamp, updatedAt: timestamp, awardedAt: null
      });
    });
  } catch (error) {
    // Retry at the next bootstrap if signup bookkeeping is temporarily unavailable.
  }
}

async function bootstrapRewards(user) {
  if (!user || !user.isAnonymous) {
    currentUser = null;
    currentWallet = null;
    deviceClaimedByAnotherUser = false;
    qualifiedReferralCount = 0;
    renderWallet();
    await refreshReferralCount();
    await renderHistory();
    return;
  }

  currentUser = user;
  deviceClaimedByAnotherUser = false;
  const userId = user.uid;
  currentWallet = null;
  renderWallet();
  historyList.innerHTML = `<p class="reward-empty">${t('ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ဖတ်နေပါသည်…')}</p>`;
  try {
    const profileSnapshot = await getDoc(doc(db, 'userProfiles', user.uid));
    if (currentUser?.uid !== userId) return;
    if (!profileSnapshot.exists()) {
      checkinMessage.textContent = t('ဆုကြေးအသုံးပြုရန် ကိုယ်ရေးအချက်အလက်ကို အရင်ဖြည့်ပြီး သိမ်းဆည်းပါ။');
      return;
    }
    const walletRef = doc(db, 'rewardWallets', user.uid);
    await runTransaction(db, async transaction => {
      const walletSnapshot = await transaction.get(walletRef);
      if (!walletSnapshot.exists()) {
        transaction.set(walletRef, {
          uid: user.uid,
          pointsBalance: 0,
          streakCount: 0,
          totalCheckIns: 0,
          completedSevenDayCycles: 0,
          lastSevenDayCycleAt: null,
          lastCheckInAt: null,
          lastCheckInDeviceId: null,
          lastFreePassAt: null,
          lastSevenDayCycleAt: null,
          lastReferralClaimId: null,
          lastReferralClaimAt: null,
          lastWithdrawalAt: null,
          lastWithdrawalRequestId: null,
          lastRefundRequestId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    await ensureReferralClaim(user);
    const inviteeReferralAwarded = await awardInviteeReferral(user);
    const referralBonusesClaimed = await claimPendingReferralBonuses(user);
    const walletSnapshot = await getDoc(walletRef);
    if (currentUser?.uid !== userId) return;
    currentWallet = walletSnapshot.exists() ? walletSnapshot.data() : null;
    if (installationId) {
      const claimSnapshot = await getDoc(deviceClaimRef());
      if (currentUser?.uid !== userId) return;
      const claim = claimSnapshot.exists() ? claimSnapshot.data() : null;
      deviceClaimedByAnotherUser = Boolean(
        claim && claim.dayNumber === bangkokDayNumber(new Date()) && claim.uid !== userId
      );
    }
    renderWallet();
    await refreshReferralCount();
    if (referralBonusesClaimed) {
      showNotice(t('မိတ်ဆွေ ၇ ရက်ပြည့်သည့်ဆုအဖြစ် {points} မှတ် အလိုအလျောက်ရရှိပါပြီ။', {
        points: localizedNumber(referralBonusesClaimed * REFERRAL_BONUS_POINTS)
      }), 'success');
    }
    if (inviteeReferralAwarded) {
      showNotice(t('၇ ရက်ဆက်တိုက်ဝင်ရောက်မှု အောင်မြင်သည့်အတွက် မိတ်ဆွေဖိတ်ခေါ်ဆု {points} မှတ် ရရှိပါပြီ။', {
        points: localizedNumber(REFERRAL_BONUS_POINTS)
      }), 'success');
    }
    await renderHistory();
  } catch (error) {
    if (currentUser?.uid !== userId) return;
    currentWallet = null;
    renderWallet();
    showNotice(t('အမှတ်စာရင်းကို ဖတ်မရပါ။ အင်တာနက်နှင့် Firebase ဝင်ခွင့်ကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။'), 'error');
  }
}

shareReferralButton.addEventListener('click', shareReferralLink);
rewardSoundToggle.addEventListener('click', () => {
  try {
    const next = isRewardSoundEnabled() ? 'off' : 'on';
    localStorage.setItem(SOUND_STORAGE_KEY, next);
    renderRewardExtras();
  } catch (error) {
    showNotice(t('ဤ browser တွင် အသံရွေးချယ်မှုကို သိမ်းဆည်း၍မရပါ။'), 'error');
  }
});

checkinButton.addEventListener('click', async () => {
  if (!currentUser || !currentWallet || isBusy || !installationId || deviceClaimedByAnotherUser) return;
  setBusy(true);
  showNotice('');
  try {
    const userId = currentUser.uid;
    const walletRef = doc(db, 'rewardWallets', userId);
    const result = await runTransaction(db, async transaction => {
      const dayNumber = bangkokDayNumber(new Date());
      const claimRef = deviceClaimRef();
      const [snapshot, claimSnapshot] = await Promise.all([
        transaction.get(walletRef),
        transaction.get(claimRef)
      ]);
      if (!snapshot.exists()) throw new Error('Wallet not found');
      const existingClaim = claimSnapshot.exists() ? claimSnapshot.data() : null;
      if (existingClaim?.dayNumber === dayNumber) {
        throw new Error(claimSnapshot.data().uid === currentUser.uid
          ? 'ALREADY_CHECKED_IN'
          : 'DEVICE_ALREADY_CHECKED_IN');
      }
      const wallet = snapshot.data();
      const last = asDate(wallet.lastCheckInAt);
      const elapsedDays = last ? dayDifference(new Date(), last) : -1;
      if (last && elapsedDays <= 0) throw new Error('ALREADY_CHECKED_IN');
      const lastFreePassAt = asDate(wallet.lastFreePassAt);
      const freePassAvailable = !lastFreePassAt || Date.now() - lastFreePassAt.getTime() >= FREE_PASS_COOLDOWN_MS;
      const usedFreePass = Boolean(last && elapsedDays === 2 && Number(wallet.streakCount || 0) > 0 && freePassAvailable);
      const streakReset = Boolean(last && elapsedDays > 1 && !usedFreePass);
      const previousStreak = Number(wallet.streakCount || 0);
      const nextStreak = !last || streakReset ? 1 : previousStreak + 1;
      const completedCycle = nextStreak === CHECKIN_CYCLE_DAYS;
      const dailyPoints = completedCycle ? SEVENTH_DAY_POINTS : DAILY_CHECKIN_POINTS;
      const timestamp = serverTimestamp();
      transaction.update(walletRef, {
        pointsBalance: Number(wallet.pointsBalance || 0) + dailyPoints,
        streakCount: completedCycle ? 0 : nextStreak,
        totalCheckIns: Number(wallet.totalCheckIns || 0) + 1,
        completedSevenDayCycles: Number(wallet.completedSevenDayCycles || 0) + (completedCycle ? 1 : 0),
        lastSevenDayCycleAt: completedCycle ? timestamp : (wallet.lastSevenDayCycleAt || null),
        lastCheckInAt: timestamp,
        lastCheckInDeviceId: installationId,
        lastFreePassAt: usedFreePass ? timestamp : (wallet.lastFreePassAt || null),
        updatedAt: timestamp
      });
      transaction.set(claimRef, {
        uid: currentUser.uid,
        deviceId: installationId,
        dayNumber,
        createdAt: existingClaim?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { completedCycle, dailyPoints, usedFreePass, streakReset };
    });
    const inviteeReferralAwarded = await awardInviteeReferral(currentUser);
    await bootstrapRewards(currentUser);
    const messages = [t('ဒီနေ့ဝင်ရောက်မှု အောင်မြင်ပါသည်။ {points} မှတ်ရရှိပါပြီ။', { points: localizedNumber(result.dailyPoints + (inviteeReferralAwarded ? REFERRAL_BONUS_POINTS : 0)) })];
    if (result.completedCycle) messages.push(t('၇ ရက်စက်ဝန်းအထူးဆု +{points} မှတ်။', { points: localizedNumber(SEVENTH_DAY_SPECIAL_BONUS) }));
    if (result.usedFreePass) messages.push(t('Free Pass ကို သုံးလိုက်ပါပြီ။ နောက်တစ်ကြိမ် ရက် ၃၀ ပြည့်မှ အသုံးပြုနိုင်ပါမည်။'));
    if (result.streakReset) messages.push(t('တစ်ရက်လွတ်သွားသောကြောင့် streak ကို ပြန်စတင်ပါသည်။'));
    if (inviteeReferralAwarded) messages.push(t('၇ ရက်ဆက်တိုက်ဝင်ရောက်မှု အောင်မြင်သည့်အတွက် မိတ်ဆွေဖိတ်ခေါ်ဆု ၁၀၀ မှတ် ရရှိပါပြီ။'));
    showNotice(messages.join(' '), 'success');
    celebrateReward();
  } catch (error) {
    await bootstrapRewards(currentUser);
    showNotice(error.message === 'DEVICE_ALREADY_CHECKED_IN'
      ? t('ဒီနေ့ ဤဖုန်း/browser မှ ဝင်ရောက်မှု ပြုလုပ်ပြီးပါပြီ။')
      : error.message === 'ALREADY_CHECKED_IN'
        ? t('ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့ ဝင်ရောက်မှု ပြုလုပ်ပြီးပါပြီ။')
      : t('ဒီနေ့ ဝင်ရောက်မှုကို သိမ်းမရပါ။ ယနေ့အတွက် မှတ်တမ်းတင်ပြီးသားဖြစ်ခြင်း သို့မဟုတ် အင်တာနက်ပြတ်တောက်ခြင်း ဖြစ်နိုင်ပါသည်။'), 'error');
  } finally {
    setBusy(false);
    renderWallet();
  }
});

function openWithdrawalDialog() {
  if (!currentWallet || withdrewToday() || currentWallet.pointsBalance < MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT) return;
  const maximumBaht = Math.floor(currentWallet.pointsBalance / POINTS_PER_BAHT);
  withdrawalAmount.min = String(MIN_WITHDRAWAL_BAHT);
  withdrawalAmount.max = String(maximumBaht);
  withdrawalAmount.value = String(MIN_WITHDRAWAL_BAHT);
  withdrawalPoints.textContent = t('{points} မှတ်', { points: (MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM') });
  walletNameInput.value = '';
  walletNumberInput.value = '';
  withdrawalConsent.checked = false;
  setWithdrawalError('');
  withdrawalDialog.hidden = false;
  withdrawalDialog.classList.add('is-open');
  withdrawalAmount.focus();
}

function closeWithdrawalDialog(force = false) {
  if (isBusy && !force) return;
  withdrawalDialog.classList.remove('is-open');
  withdrawalDialog.hidden = true;
}

withdrawButton.addEventListener('click', openWithdrawalDialog);
closeWithdrawalButton.addEventListener('click', closeWithdrawalDialog);
cancelWithdrawalButton.addEventListener('click', closeWithdrawalDialog);
withdrawalDialog.addEventListener('click', event => {
  if (event.target === withdrawalDialog) closeWithdrawalDialog();
});
function updateWithdrawalPoints() {
  const amount = Math.max(0, Number(withdrawalAmount.value || 0));
  withdrawalPoints.textContent = t('{points} မှတ်', { points: Math.round(amount * POINTS_PER_BAHT).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'my-MM') });
}
withdrawalAmount.addEventListener('input', updateWithdrawalPoints);

withdrawalForm.addEventListener('submit', async event => {
  event.preventDefault();
  setWithdrawalError('');
  if (!currentUser || !currentWallet) {
    setWithdrawalError('ကိုယ်ရေးအချက်အလက်နှင့် အမှတ်လက်ကျန်ကို ဖတ်ပြီးနောက် ထပ်ကြိုးစားပါ။');
    return;
  }
  if (!withdrawalForm.reportValidity()) return;

  const amountBaht = Number(withdrawalAmount.value);
  const pointsRequested = amountBaht * POINTS_PER_BAHT;
  const walletAccountName = walletNameInput.value.trim();
  const walletAccountNumber = walletNumberInput.value.replace(/\D/g, '');
  if (!Number.isInteger(amountBaht) || amountBaht < MIN_WITHDRAWAL_BAHT) {
    setWithdrawalError('အနည်းဆုံး ၁၀ ဘတ် ထုတ်ယူနိုင်ပါသည်။');
    return;
  }
  if (pointsRequested > currentWallet.pointsBalance) {
    setWithdrawalError('အမှတ်လက်ကျန် မလုံလောက်ပါ။');
    return;
  }
  if (!/^\d{8,15}$/.test(walletAccountNumber)) {
    setWithdrawalError('TrueMoney တွင် မှတ်ပုံတင်ထားသော ဂဏန်း ၈ လုံးမှ ၁၅ လုံးအထိ ဖုန်း/အကောင့်နံပါတ်ကို ထည့်ပါ။');
    return;
  }
  if (!withdrawalConsent.checked) {
    setWithdrawalError('အကောင့်အချက်အလက်ကို မျှဝေရန် သဘောတူကြောင်း အမှန်ခြစ်ပါ။');
    return;
  }

  setBusy(true);
  submitWithdrawalButton.dataset.isSubmitting = 'true';
  submitWithdrawalButton.textContent = t('ပေးပို့နေပါသည်…');
  try {
    const requestRef = doc(collection(db, 'withdrawalRequests'));
    const walletRef = doc(db, 'rewardWallets', currentUser.uid);
    const profileRef = doc(db, 'userProfiles', currentUser.uid);
    await runTransaction(db, async transaction => {
      const [walletSnapshot, profileSnapshot] = await Promise.all([
        transaction.get(walletRef), transaction.get(profileRef)
      ]);
      if (!walletSnapshot.exists() || !profileSnapshot.exists()) throw new Error('ကိုယ်ရေးအချက်အလက် သို့မဟုတ် အမှတ်စာရင်းကို ရှာမတွေ့ပါ။');
      const wallet = walletSnapshot.data();
      if (wallet.pointsBalance < pointsRequested) throw new Error('အမှတ်လက်ကျန် မလုံလောက်ပါ။');
      const lastWithdrawal = asDate(wallet.lastWithdrawalAt);
      if (lastWithdrawal && dayDifference(new Date(), lastWithdrawal) <= 0) throw new Error('ALREADY_WITHDREW_TODAY');
      const profile = profileSnapshot.data();
      const timestamp = serverTimestamp();
      transaction.update(walletRef, {
        pointsBalance: wallet.pointsBalance - pointsRequested,
        lastWithdrawalAt: timestamp,
        lastWithdrawalRequestId: requestRef.id,
        updatedAt: timestamp
      });
      transaction.set(requestRef, {
        requestId: requestRef.id,
        uid: currentUser.uid,
        userFullName: profile.fullName,
        pointsRequested,
        amountBaht,
        currency: 'THB',
        walletProvider: 'TrueMoney Wallet',
        walletAccountName,
        walletAccountNumber,
        status: 'pending',
        refunded: false,
        adminNote: '',
        consentVersion: WITHDRAWAL_CONSENT_VERSION,
        consentedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        reviewedAt: null,
        processedAt: null,
        rejectedAt: null
      });
    });
    closeWithdrawalDialog(true);
    await bootstrapRewards(currentUser);
    showNotice(t('တောင်းဆိုမှုကို စီမံခန့်ခွဲသူထံ ပေးပို့ပြီးပါပြီ။ စီမံခန့်ခွဲသူက စစ်ဆေးပြီး ၂၄ နာရီအတွင်း TrueMoney သို့ ကိုယ်တိုင်ငွေလွှဲရန် ရည်ရွယ်ထားပါသည်။'), 'success');
  } catch (error) {
    await bootstrapRewards(currentUser);
    setWithdrawalError(error.message === 'ALREADY_WITHDREW_TODAY'
      ? t('ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့အတွက် ငွေထုတ်တောင်းဆိုမှု ပြုလုပ်ပြီးပါပြီ။')
      : t(error.message || 'တောင်းဆိုမှု မပို့နိုင်ပါ။ ထပ်ကြိုးစားပါ။'));
  } finally {
    setBusy(false);
    submitWithdrawalButton.dataset.isSubmitting = 'false';
    submitWithdrawalButton.textContent = t('ငွေထုတ်ရန် တောင်းဆိုမည်');
    renderWallet();
  }
});

onAuthStateChanged(auth, user => { void bootstrapRewards(user); });
window.addEventListener('dailywage-profile-saved', () => {
  if (auth.currentUser) void bootstrapRewards(auth.currentUser);
});
window.addEventListener('focus', () => {
  if (auth.currentUser?.isAnonymous) void bootstrapRewards(auth.currentUser);
});
window.addEventListener('dailywage-language-changed', () => {
  renderWallet();
  void renderHistory();
  updateWithdrawalPoints();
  showNotice(rewardNotice.dataset.sourceMessage || '', rewardNotice.dataset.type || 'info');
  setWithdrawalError(withdrawalError.dataset.sourceMessage || '');
  submitWithdrawalButton.textContent = t(submitWithdrawalButton.dataset.isSubmitting === 'true' ? 'ပေးပို့နေပါသည်…' : 'ငွေထုတ်ရန် တောင်းဆိုမည်');
});
