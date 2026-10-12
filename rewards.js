import {
  auth, db, collection, doc, getDoc, getDocs, onAuthStateChanged,
  query, runTransaction, serverTimestamp, where
} from './firebase.js';

const POINTS_PER_BAHT = 100;
const MIN_WITHDRAWAL_BAHT = 10;
const CHECKIN_REWARD_POINTS = 1000;
const CHECKIN_CYCLE_DAYS = 7;
const WITHDRAWAL_CONSENT_VERSION = 1;
const TIME_ZONE = 'Asia/Bangkok';

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

let currentUser = null;
let currentWallet = null;
let isBusy = false;

function bangkokDayKey(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
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
  return new Intl.DateTimeFormat('my-MM', {
    timeZone: TIME_ZONE, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function statusLabel(status) {
  return ({
    pending: 'တောင်းဆိုမှု လက်ခံရရှိပြီး',
    processing: 'စစ်ဆေးနေဆဲ',
    paid: 'ငွေလွှဲပြီး',
    rejected: 'ပယ်ဖျက်ပြီး · အမှတ်ပြန်အမ်းပြီး'
  })[status] || 'အခြေအနေ မသိရပါ';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function showNotice(message, type = 'info') {
  rewardNotice.textContent = message;
  rewardNotice.dataset.type = type;
  rewardNotice.hidden = !message;
}

function setWithdrawalError(message) {
  withdrawalError.textContent = message;
  withdrawalError.hidden = !message;
}

function setBusy(value) {
  isBusy = value;
  checkinButton.disabled = value || !currentWallet || isCheckedInToday();
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
    bahtEquivalent.textContent = 'ကိုယ်ရေးအချက်အလက် သိမ်းဆည်းပြီးမှ အမှတ်များ ပြသပါမည်';
    streakValue.textContent = '0 / 7';
    checkinMessage.textContent = 'ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ထပ်မံဝင်ရောက်ပါ။';
    checkinButton.disabled = true;
    withdrawButton.disabled = true;
    return;
  }

  const points = Number(currentWallet.pointsBalance || 0);
  const streak = Number(currentWallet.streakCount || 0);
  pointBalance.textContent = points.toLocaleString('en-US');
  bahtEquivalent.textContent = `${(points / POINTS_PER_BAHT).toLocaleString('en-US')} ဘတ်တန်ဖိုး`;
  streakValue.textContent = `${streak} / ${CHECKIN_CYCLE_DAYS}`;
  document.getElementById('rewardProgressFill').style.width = `${Math.min(100, (streak / CHECKIN_CYCLE_DAYS) * 100)}%`;

  if (isCheckedInToday()) {
    checkinMessage.textContent = 'ဒီနေ့ ဝင်ရောက်မှု မှတ်တမ်းတင်ပြီးပါပြီ။ နောက်တစ်ကြိမ်ကို ဘန်ကောက်စံတော်ချိန်အရ မနက်ဖြန်မှ ပြုလုပ်နိုင်ပါမည်။';
  } else {
    checkinMessage.textContent = `ဘန်ကောက်စံတော်ချိန်အရ တစ်နေ့တစ်ကြိမ် ဝင်ရောက်ပါ။ ${CHECKIN_CYCLE_DAYS} ရက်ဆက်တိုက် ဝင်ရောက်ပါက ${CHECKIN_REWARD_POINTS.toLocaleString('en-US')} မှတ် ရရှိပါမည်။`;
  }
  checkinButton.disabled = isBusy || isCheckedInToday() || !currentUser;
  withdrawButton.disabled = isBusy || withdrewToday() || points < MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT || !currentUser;
}

async function renderHistory() {
  const user = currentUser;
  if (!user) {
    historyList.innerHTML = '<p class="reward-empty">ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ကြည့်နိုင်ပါသည်။</p>';
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
      historyList.innerHTML = '<p class="reward-empty">ယခုအချိန်တွင် ငွေထုတ်တောင်းဆိုမှု မရှိသေးပါ။</p>';
      return;
    }
    historyList.innerHTML = entries.map(entry => {
      const digits = String(entry.walletAccountNumber || '');
      const masked = digits ? `•••• ${digits.slice(-4)}` : '—';
      const statusClass = ['pending', 'processing', 'paid', 'rejected'].includes(entry.status) ? entry.status : 'unknown';
      return `<article class="withdrawal-history-item">
        <div class="withdrawal-history-top"><strong>${Number(entry.amountBaht || 0).toLocaleString('en-US')} ဘတ်</strong><span class="withdrawal-status ${statusClass}">${statusLabel(entry.status)}</span></div>
        <div class="withdrawal-history-meta">TrueMoney ပိုက်ဆံအိတ် · ${masked} · ${displayDate(entry.createdAt)}</div>
        <div class="withdrawal-history-points">${Number(entry.pointsRequested || 0).toLocaleString('en-US')} မှတ်</div>
        ${entry.adminNote ? `<div class="withdrawal-history-note">စီမံခန့်ခွဲသူ၏ မှတ်ချက်: ${escapeHtml(entry.adminNote)}</div>` : ''}
      </article>`;
    }).join('');
  } catch (error) {
    historyList.innerHTML = '<p class="reward-empty">မှတ်တမ်းကို ယခုဖတ်မရပါ။ စာမျက်နှာကို ပြန်ဖွင့်ပါ။</p>';
  }
}

async function bootstrapRewards(user) {
  if (!user || !user.isAnonymous) {
    currentUser = null;
    currentWallet = null;
    renderWallet();
    await renderHistory();
    return;
  }

  currentUser = user;
  const userId = user.uid;
  currentWallet = null;
  renderWallet();
  historyList.innerHTML = '<p class="reward-empty">ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ဖတ်နေပါသည်…</p>';
  try {
    const profileSnapshot = await getDoc(doc(db, 'userProfiles', user.uid));
    if (currentUser?.uid !== userId) return;
    if (!profileSnapshot.exists()) {
      checkinMessage.textContent = 'ဆုကြေးအသုံးပြုရန် ကိုယ်ရေးအချက်အလက်ကို အရင်ဖြည့်ပြီး သိမ်းဆည်းပါ။';
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
          lastCheckInAt: null,
          lastWithdrawalAt: null,
          lastWithdrawalRequestId: null,
          lastRefundRequestId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    const walletSnapshot = await getDoc(walletRef);
    if (currentUser?.uid !== userId) return;
    currentWallet = walletSnapshot.exists() ? walletSnapshot.data() : null;
    renderWallet();
    await renderHistory();
  } catch (error) {
    if (currentUser?.uid !== userId) return;
    currentWallet = null;
    renderWallet();
    showNotice('အမှတ်စာရင်းကို ဖတ်မရပါ။ အင်တာနက်နှင့် Firebase ဝင်ခွင့်ကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။', 'error');
  }
}

checkinButton.addEventListener('click', async () => {
  if (!currentUser || !currentWallet || isBusy) return;
  setBusy(true);
  showNotice('');
  try {
    const walletRef = doc(db, 'rewardWallets', currentUser.uid);
    const result = await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(walletRef);
      if (!snapshot.exists()) throw new Error('Wallet not found');
      const wallet = snapshot.data();
      const last = asDate(wallet.lastCheckInAt);
      const elapsedDays = last ? dayDifference(new Date(), last) : -1;
      if (last && elapsedDays <= 0) throw new Error('ALREADY_CHECKED_IN');
      const nextStreak = !last || elapsedDays > 1 ? 1 : Number(wallet.streakCount || 0) + 1;
      const earned = nextStreak === CHECKIN_CYCLE_DAYS;
      transaction.update(walletRef, {
        pointsBalance: Number(wallet.pointsBalance || 0) + (earned ? CHECKIN_REWARD_POINTS : 0),
        streakCount: earned ? 0 : nextStreak,
        lastCheckInAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { earned };
    });
    await bootstrapRewards(currentUser);
    showNotice(result.earned
      ? `ဂုဏ်ယူပါတယ်။ ${CHECKIN_REWARD_POINTS.toLocaleString('en-US')} မှတ် ထပ်ရရှိပါပြီ။`
      : 'ဒီနေ့ ဝင်ရောက်မှု အောင်မြင်ပါသည်။ နောက်ရက်များတွင် ဆက်လက်ဝင်ရောက်ပါ။', 'success');
  } catch (error) {
    await bootstrapRewards(currentUser);
    showNotice(error.message === 'ALREADY_CHECKED_IN'
      ? 'ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့ ဝင်ရောက်မှု ပြုလုပ်ပြီးပါပြီ။'
      : 'ဒီနေ့ ဝင်ရောက်မှုကို သိမ်းမရပါ။ ယနေ့အတွက် မှတ်တမ်းတင်ပြီးသားဖြစ်ခြင်း သို့မဟုတ် အင်တာနက်ပြတ်တောက်ခြင်း ဖြစ်နိုင်ပါသည်။', 'error');
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
  withdrawalPoints.textContent = `${(MIN_WITHDRAWAL_BAHT * POINTS_PER_BAHT).toLocaleString('en-US')} မှတ်`;
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
withdrawalAmount.addEventListener('input', () => {
  const amount = Math.max(0, Number(withdrawalAmount.value || 0));
  withdrawalPoints.textContent = `${Math.round(amount * POINTS_PER_BAHT).toLocaleString('en-US')} မှတ်`;
});

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
  submitWithdrawalButton.textContent = 'ပေးပို့နေပါသည်…';
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
    showNotice('တောင်းဆိုမှုကို စီမံခန့်ခွဲသူထံ ပေးပို့ပြီးပါပြီ။ စီမံခန့်ခွဲသူက စစ်ဆေးပြီး ၂၄ နာရီအတွင်း TrueMoney သို့ ကိုယ်တိုင်ငွေလွှဲရန် ရည်ရွယ်ထားပါသည်။', 'success');
  } catch (error) {
    await bootstrapRewards(currentUser);
    setWithdrawalError(error.message === 'ALREADY_WITHDREW_TODAY'
      ? 'ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့အတွက် ငွေထုတ်တောင်းဆိုမှု ပြုလုပ်ပြီးပါပြီ။'
      : (error.message || 'တောင်းဆိုမှု မပို့နိုင်ပါ။ ထပ်ကြိုးစားပါ။'));
  } finally {
    setBusy(false);
    submitWithdrawalButton.textContent = 'ငွေထုတ်ရန် တောင်းဆိုမည်';
    renderWallet();
  }
});

onAuthStateChanged(auth, user => { void bootstrapRewards(user); });
window.addEventListener('dailywage-profile-saved', () => {
  if (auth.currentUser) void bootstrapRewards(auth.currentUser);
});
