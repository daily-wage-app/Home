const LANGUAGE_STORAGE_KEY = 'dailyWageMenuLanguage';

const translations = {
  'Daily Wage စတင်အသုံးပြုရန်': 'Get started with Daily Wage',
  'ကိုယ်ရေးအချက်အလက် ဖြည့်သွင်းပါ': 'Complete your profile',
  'အက်ပ်ကို စတင်အသုံးပြုရန် ကိုယ်ရေးအချက်အလက် ဖြည့်ပါ။ * ပါသောအကွက်များကို မဖြစ်မနေ ဖြည့်ရပါမည်။': 'Complete your profile to start using the app. Fields marked * are required.',
  'အက်ပ်ကို အသုံးပြုရန် ကိုယ်ရေးအချက်အလက်ကို အရင်ဖြည့်ပါ။ * ပါသောအကွက်များကို မဖြစ်မနေ ဖြည့်ရပါမည်။': 'Complete your profile before using the app. Fields marked * are required.',
  'ကိုယ်ရေးအချက်အလက်ကို ပြင်ဆင်ပါ။ ပြောင်းလဲမှုများကို Daily Wage အကောင့်တွင် လုံခြုံစွာ သိမ်းဆည်းပါမည်။': 'Edit your profile. Changes will be securely saved to your Daily Wage account.',
  'အမည်အပြည့်အစုံ *': 'Full name *',
  'ဥပမာ - မောင်မောင်': 'For example, Alex Smith',
  'မွေးသက္ကရာဇ် *': 'Date of birth *',
  'နိုင်ငံ *': 'Country *',
  'နိုင်ငံကို ရွေးပါ': 'Select a country',
  'ဘင်္ဂလားဒေ့ရှ်': 'Bangladesh',
  'အိန္ဒိယ': 'India',
  'မြန်မာ': 'Myanmar',
  'စင်ကာပူ': 'Singapore',
  'ထိုင်း': 'Thailand',
  'အခြား': 'Other',
  'ဖုန်းနံပါတ်': 'Phone number',
  '(မဖြစ်မနေ မဟုတ်ပါ)': '(optional)',
  'အီးမေးလ်': 'Email',
  'ကျား/မ အမျိုးအစား *': 'Gender *',
  'အမျိုးသမီး': 'Female',
  'အမျိုးသား': 'Male',
  'အခြားအမျိုးအစား': 'Other',
  'မဖြေလိုပါ': 'Prefer not to say',
  'အကောင့်ဖွင့်ရန်နှင့် ဝန်ဆောင်မှုဆိုင်ရာ ခွဲခြမ်းစိတ်ဖြာမှုအတွက် Daily Wage က ဤကိုယ်ရေးအချက်အလက်များကို ၎င်း၏ဒေတာစနစ်သို့ ပေးပို့နိုင်ကြောင်း သဘောတူပါသည်။': 'I agree that Daily Wage may send this profile information to its data system to create my account and analyze service usage.',
  'မလုပ်တော့ပါ': 'Cancel',
  'သိမ်းဆည်းပြီး ဆက်သွားရန်': 'Save and continue',
  'သဘောတူပြီးနောက် ကိုယ်ရေးအချက်အလက်များကို HTTPS ဖြင့် Firebase သို့ ပေးပို့ပြီး ဤစက်တွင်လည်း သိမ်းဆည်းပါမည်။ မပို့နိုင်ပါက ဤစက်တွင် မူကြမ်းသိမ်းထားပြီး ပြန်လည်ကြိုးစားနိုင်ပါသည်။': 'After you consent, your profile is sent to Firebase over HTTPS and also saved on this device. If syncing fails, a draft stays on this device so you can try again.',
  'TrueMoney မှ ငွေထုတ်ယူရန်': 'Withdraw with TrueMoney',
  'ပိတ်ရန်': 'Close',
  'အနည်းဆုံး ၁၀ ဘတ် (၁,၀၀၀ မှတ်) ထုတ်ယူနိုင်ပါသည်။ တောင်းဆိုသည့်အချိန်တွင် လိုအပ်သောအမှတ်များကို ဖြတ်တောက်ပါမည်။': 'The minimum withdrawal is 10 baht (1,000 points). Required points are deducted when you submit a request.',
  'ထုတ်ယူမည့်ပမာဏ (ဘတ်) *': 'Withdrawal amount (THB) *',
  'လိုအပ်သောအမှတ်:': 'Points required:',
  '· အမှတ် ၁၀၀ = ၁ ဘတ်': '· 100 points = 1 baht',
  '၁,၀၀၀ မှတ်': '1,000 points',
  'TrueMoney အကောင့်ပိုင်ရှင်အမည် *': 'TrueMoney account holder name *',
  'TrueMoney တွင် မှတ်ပုံတင်ထားသော ဖုန်း/အကောင့်နံပါတ် *': 'Phone/account number registered with TrueMoney *',
  'ဤတောင်းဆိုမှုအတွက် ကျွန်ုပ်၏ TrueMoney အမည်၊ အကောင့်နံပါတ်၊ ထုတ်ယူမည့်ပမာဏနှင့် Daily Wage ကိုယ်ရေးအချက်အလက်အမည်ကို စီမံခန့်ခွဲသူထံ ပေးပို့စစ်ဆေးရန် သဘောတူပါသည်။': 'I agree to share my TrueMoney name and account number, withdrawal amount, and Daily Wage profile name with the administrator for review of this request.',
  'တစ်နေ့လျှင် တစ်ကြိမ်သာ တောင်းဆိုနိုင်ပါသည်။ စီမံခန့်ခွဲသူက စစ်ဆေးပြီး ၂၄ နာရီအတွင်း ကိုယ်တိုင်ငွေလွှဲရန် ရည်ရွယ်ထားသော်လည်း ဤစာမျက်နှာမှ ငွေကို အလိုအလျောက် လွှဲပေးမည်မဟုတ်ပါ။ ပယ်ချခံရပါက ဖြတ်တောက်ထားသောအမှတ်များကို အလိုအလျောက် ပြန်အမ်းပါမည်။': 'You may submit one request per day. The administrator aims to review it and manually transfer the money within 24 hours; this page does not transfer money automatically. Points are refunded automatically if your request is rejected.',
  'ငွေထုတ်ရန် တောင်းဆိုမည်': 'Request withdrawal',
  'အလုပ်အကိုင် ရှာရန်': 'Search for work',
  'နေ့စား app လုပ်ဆောင်ချက်များ ဖွင့်ရန်': 'Open Daily Wage features',
  'အခြားရွေးချယ်စရာများ ဖွင့်ရန်': 'Open more options',
  'နေ့စားအလုပ်၊ ဆုလက်ဆောင်နှင့် ဝင်ငွေစီမံမှု': 'Daily jobs, rewards and income planning',
  'အမြန်သွားရန်': 'Quick links',
  'ပင်မစာမျက်နှာ': 'Home',
  'နေ့စားအလုပ်များ': 'Daily jobs',
  'Smart Wage တွက်စက်': 'Smart Wage calculator',
  'နေ့စဉ် check-in နှင့် အမှတ်': 'Daily check-in and points',
  'ဆုနှင့် ငွေထုတ်မှတ်တမ်း': 'Rewards and withdrawal history',
  'ကိုယ်ရေးအချက်အလက်': 'My profile',
  'လုပ်ဆောင်ချက်များ': 'Features',
  'အလုပ်ရှာဖွေရန်။': 'Find work.',
  'နေ့စားအလုပ်များကို ကြည့်ရှုပြီး စူးစမ်းနိုင်ပါသည်။': 'Browse available daily job listings.',
  'ဆုရယူရန်။': 'Earn rewards.',
  'ဘန်ကောက်စံတော်ချိန်ဖြင့် နေ့စဉ် check-in လုပ်ပြီး အမှတ်စုဆောင်းပါ။': 'Check in daily using Bangkok time and collect points.',
  'ဝင်ငွေစီမံရန်။': 'Plan your income.',
  'လုပ်အားခ၊ အလုပ်ရက်၊ ကုန်ကျစရိတ်နှင့် ငွေစုရည်မှန်းချက်ကို တွက်ချက်ပါ။': 'Estimate wages, workdays, expenses and savings goals.',
  'မှတ်တမ်းစစ်ရန်။': 'Review your history.',
  'ဆုလက်ကျန်နှင့် TrueMoney ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ကြည့်ပါ။': 'Review your points balance and TrueMoney withdrawal requests.',
  'ဘာသာစကား': 'Language',
  'ဘာသာစကားရွေးချယ်မှုကို ဤ browser တွင် သိမ်းထားပါမည်။ English ရွေးပါက ဤအမြန်မီနူးနှင့် အောက်ခြေသွားလာမှုစာသားများကို ပြောင်းပေးပါမည်။': 'Your language choice is saved in this browser. English translates the entire Home app interface.',
  'အသုံးပြုသူအသစ်': 'New user',
  'ကိုယ်ရေးအချက်အလက် ဖြည့်ပါ': 'Complete your profile',
  '🌍 နိုင်ငံ မရွေးရသေးပါ': '🌍 No country selected',
  'ပြင်ဆင်ရန်': 'Edit profile',
  'အလုပ်အခြေအနေ': 'Work overview',
  'အသေးစိတ် >': 'Details >',
  'ယနေ့ရရှိနိုင်သော အလုပ်များ': 'Jobs available today',
  'ရရှိနိုင်သောအလုပ်များ': 'Available jobs',
  'အနီးအနားတွင်': 'Nearby',
  'Daily Wage ဆုကြေး': 'Daily Wage rewards',
  'နေ့စဉ်ဆုကြေး': 'Daily rewards',
  'ဆက်တိုက်ဝင်ရောက်မှု': 'Check-in streak',
  'မှတ် ·': 'points ·',
  '၇ ရက်ဆက်တိုက် ဝင်ရောက်မှုအခြေအနေ': 'Seven-day check-in progress',
  'ကိုယ်ရေးအချက်အလက်နှင့် အမှတ်စာရင်းကို ဖတ်နေပါသည်…': 'Loading your profile and points…',
  'ဒီနေ့ ဝင်ရောက်မည်': 'Check in today',
  'TrueMoney မှ ထုတ်ယူမည်': 'Withdraw with TrueMoney',
  'ဤဖုန်း၏ app/browser တပ်ဆင်မှုတစ်ခုမှ တစ်နေ့တစ်ကြိမ်သာ ဝင်ရောက်နိုင်ပါသည် · ၇ ရက်ဆက်တိုက် ဝင်ရောက်ပါက အမှတ် ၁,၀၀၀ ရရှိမည် · အမှတ် ၁,၀၀၀ = ၁၀ ဘတ် · ဘန်ကောက်စံတော်ချိန်ဖြင့် တွက်ချက်သည်။': 'One check-in per day per app/browser installation · Earn 1,000 points for 7 consecutive days · 1,000 points = 10 baht · Calculated using Bangkok time.',
  'ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်း': 'Withdrawal request history',
  'မှတ်တမ်းကို ဖတ်နေပါသည်…': 'Loading history…',
  'နေ့စားဝင်ငွေ စမတ်တွက်စက်': 'Smart daily wage calculator',
  'တစ်ရက်လုပ်အားခနှင့် အလုပ်ချိန်ကို ထည့်ပါ။ အပတ်စဉ်/လစဉ် ဝင်ငွေ၊ နာရီလုပ်အားခနှင့် အသုံးစရိတ်နုတ်ပြီး ကျန်ငွေကို ခန့်မှန်းပေးပါမည်။': 'Enter your daily pay and work hours to estimate weekly/monthly income, hourly pay and income after expenses.',
  'ငွေကြေး': 'Currency',
  'ထိုင်းဘတ် (THB)': 'Thai baht (THB)',
  'မြန်မာကျပ် (MMK)': 'Myanmar kyat (MMK)',
  'အမေရိကန်ဒေါ်လာ (USD)': 'US dollar (USD)',
  'စင်ကာပူဒေါ်လာ (SGD)': 'Singapore dollar (SGD)',
  'တစ်ရက်လုပ်အားခ *': 'Daily pay *',
  'ဥပမာ 500': 'For example, 500',
  'တစ်ပတ်အလုပ်လုပ်ရက် *': 'Workdays per week *',
  '၁ မှ ၇ ရက်': '1 to 7 days',
  'တစ်ရက်အလုပ်ချိန် *': 'Work hours per day *',
  'ဥပမာ 8 နာရီ': 'For example, 8 hours',
  'လစဉ်ခန့်မှန်းအသုံးစရိတ်': 'Estimated monthly expenses',
  'ငွေစုရည်မှန်းချက်': 'Savings goal',
  'နာရီလုပ်အားခ ခန့်မှန်း': 'Estimated hourly pay',
  'အပတ်စဉ်ဝင်ငွေ': 'Weekly income',
  'လစဉ်ဝင်ငွေ ခန့်မှန်း': 'Estimated monthly income',
  'အသုံးစရိတ်နုတ်ပြီး ကျန်ငွေ': 'Income after expenses',
  'ရည်မှန်းချက်ပြည့်ရန် ခန့်မှန်း': 'Estimated time to reach goal',
  'တွက်ချက်မှုကို ရှင်းရန်': 'Clear calculator',
  'လစဉ်ဝင်ငွေကို ၁ နှစ် = ၅၂ ပတ်ဖြင့် ခန့်မှန်းထားသည်။ ထည့်သွင်းချက်များကို ဤစက်၏ browser ထဲတွင်သာ သိမ်းဆည်းပြီး Firebase သို့ မပို့ပါ။': 'Monthly income is estimated using 52 weeks per year. Your entries are stored only in this browser and are not sent to Firebase.',
  'အကြံပြုထားသောအလုပ်များ': 'Recommended jobs',
  'အားလုံးကြည့်ရန် >': 'View all >',
  'ဆောက်လုပ်ရေး': 'Construction',
  'အဆောက်အအုံလုပ်ငန်းခွင်': 'Construction work',
  'လျှောက်ထားရန် >': 'Apply >',
  'ပို့ဆောင်ရေး': 'Delivery',
  'ပစ္စည်းပို့ဆောင်ရေး': 'Goods delivery',
  'ဂိုဒေါင်': 'Warehouse',
  'ဂိုဒေါင်ပစ္စည်းထုပ်ပိုးခြင်း': 'Warehouse packing',
  'ပင်မ': 'Home',
  'အလုပ်များ': 'Jobs',
  'မှတ်တမ်း': 'History',
  'ဝင်ငွေ': 'Income',
  'အခြား': 'More',
  '🌍 ': '🌍 ',

  'ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးမှ အမှတ်များ ပြသပါမည်': 'Points will appear after you save your profile',
  'ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ထပ်မံဝင်ရောက်ပါ။': 'Save your profile before checking in.',
  '{baht} ဘတ်တန်ဖိုး': '{baht} baht equivalent',
  'ဒီနေ့ ဝင်ရောက်မှု မှတ်တမ်းတင်ပြီးပါပြီ။ နောက်တစ်ကြိမ်ကို ဘန်ကောက်စံတော်ချိန်အရ မနက်ဖြန်မှ ပြုလုပ်နိုင်ပါမည်။': 'Today’s check-in is recorded. You can check in again tomorrow Bangkok time.',
  'ဒီနေ့ ဤဖုန်း/browser မှ ဝင်ရောက်မှုကို အခြားအကောင့်ဖြင့် ရယူပြီးပါပြီ။ မနက်ဖြန်မှ ပြန်ဝင်နိုင်ပါမည်။': 'This device/browser has already been used to check in with another account today. Try again tomorrow.',
  'ဤ browser တွင် လုံခြုံသောစက် ID ကို သိမ်းမရပါ။ စက်၏ storage ကို ဖွင့်ပြီး ပြန်စမ်းပါ။': 'A secure device ID could not be saved in this browser. Enable browser storage and try again.',
  'ဤဖုန်း/browser တပ်ဆင်မှုမှ တစ်နေ့တစ်ကြိမ်သာ ဝင်ရောက်နိုင်ပါသည်။ {days} ရက်ဆက်တိုက် ဝင်ရောက်ပါက {points} မှတ် ရရှိပါမည်။': 'One check-in per day is allowed for this app/browser installation. Earn {points} points after {days} consecutive days.',
  'ကိုယ်ရေးအချက်အလက်ကို သိမ်းဆည်းပြီးနောက် ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ကြည့်နိုင်ပါသည်။': 'Save your profile to view withdrawal history.',
  'ယခုအချိန်တွင် ငွေထုတ်တောင်းဆိုမှု မရှိသေးပါ။': 'There are no withdrawal requests yet.',
  '{amount} ဘတ်': '{amount} baht',
  'TrueMoney ပိုက်ဆံအိတ်': 'TrueMoney wallet',
  '{points} မှတ်': '{points} points',
  'စီမံခန့်ခွဲသူ၏ မှတ်ချက်:': 'Administrator note:',
  'မှတ်တမ်းကို ယခုဖတ်မရပါ။ စာမျက်နှာကို ပြန်ဖွင့်ပါ။': 'Could not load history. Refresh the page and try again.',
  'ငွေထုတ်တောင်းဆိုမှုမှတ်တမ်းကို ဖတ်နေပါသည်…': 'Loading withdrawal history…',
  'ဆုကြေးအသုံးပြုရန် ကိုယ်ရေးအချက်အလက်ကို အရင်ဖြည့်ပြီး သိမ်းဆည်းပါ။': 'Complete and save your profile before using rewards.',
  'အမှတ်စာရင်းကို ဖတ်မရပါ။ အင်တာနက်နှင့် Firebase ဝင်ခွင့်ကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။': 'Could not load points. Check your internet connection and Firebase access, then try again.',
  'ဂုဏ်ယူပါတယ်။ {points} မှတ် ထပ်ရရှိပါပြီ။': 'Congratulations! You earned {points} more points.',
  'ဒီနေ့ ဝင်ရောက်မှု အောင်မြင်ပါသည်။ နောက်ရက်များတွင် ဆက်လက်ဝင်ရောက်ပါ။': 'Check-in successful. Keep checking in on the following days.',
  'ဒီနေ့ ဤဖုန်း/browser မှ ဝင်ရောက်မှု ပြုလုပ်ပြီးပါပြီ။': 'This device/browser has already been used to check in today.',
  'ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့ ဝင်ရောက်မှု ပြုလုပ်ပြီးပါပြီ။': 'You have already checked in today, Bangkok time.',
  'ဒီနေ့ ဝင်ရောက်မှုကို သိမ်းမရပါ။ ယနေ့အတွက် မှတ်တမ်းတင်ပြီးသားဖြစ်ခြင်း သို့မဟုတ် အင်တာနက်ပြတ်တောက်ခြင်း ဖြစ်နိုင်ပါသည်။': 'Could not save today’s check-in. It may already be recorded, or your internet connection may be interrupted.',
  '{points} မှတ်': '{points} points',
  'ကိုယ်ရေးအချက်အလက်နှင့် အမှတ်လက်ကျန်ကို ဖတ်ပြီးနောက် ထပ်ကြိုးစားပါ။': 'Load your profile and point balance, then try again.',
  'အနည်းဆုံး ၁၀ ဘတ် ထုတ်ယူနိုင်ပါသည်။': 'The minimum withdrawal is 10 baht.',
  'အမှတ်လက်ကျန် မလုံလောက်ပါ။': 'You do not have enough points.',
  'TrueMoney တွင် မှတ်ပုံတင်ထားသော ဂဏန်း ၈ လုံးမှ ၁၅ လုံးအထိ ဖုန်း/အကောင့်နံပါတ်ကို ထည့်ပါ။': 'Enter the 8–15 digit phone/account number registered with TrueMoney.',
  'အကောင့်အချက်အလက်ကို မျှဝေရန် သဘောတူကြောင်း အမှန်ခြစ်ပါ။': 'Check the box to consent to sharing your account information.',
  'ပေးပို့နေပါသည်…': 'Submitting…',
  'ကိုယ်ရေးအချက်အလက် သို့မဟုတ် အမှတ်စာရင်းကို ရှာမတွေ့ပါ။': 'Profile or point balance could not be found.',
  'တောင်းဆိုမှုကို စီမံခန့်ခွဲသူထံ ပေးပို့ပြီးပါပြီ။ စီမံခန့်ခွဲသူက စစ်ဆေးပြီး ၂၄ နာရီအတွင်း TrueMoney သို့ ကိုယ်တိုင်ငွေလွှဲရန် ရည်ရွယ်ထားပါသည်။': 'Your request was sent to the administrator. They aim to review it and manually transfer the money to TrueMoney within 24 hours.',
  'ဘန်ကောက်စံတော်ချိန်အရ ဒီနေ့အတွက် ငွေထုတ်တောင်းဆိုမှု ပြုလုပ်ပြီးပါပြီ။': 'A withdrawal request has already been made today, Bangkok time.',
  'တောင်းဆိုမှု မပို့နိုင်ပါ။ ထပ်ကြိုးစားပါ။': 'Could not submit the request. Please try again.',
  'အချက်အလက် သိမ်းဆည်းပြီး': 'Information saved',
  'အချက်အလက် ပေးပို့ရန်လိုသည်': 'Information needs to be synced',
  '🌍 နိုင်ငံ မရွေးရသေးပါ': '🌍 No country selected',
  'မဖြစ်မနေ ဖြည့်ရမည့်အချက်အလက်များကို ဖြည့်ပြီး ဒေတာအသုံးပြုမှု သဘောတူညီချက်ကို အမှန်ခြစ်ပါ။': 'Complete all required fields and accept the data-use consent.',
  'သိမ်းဆည်းနေပါသည်…': 'Saving…',
  'ကိုယ်ရေးအချက်အလက်ကို Daily Wage အကောင့်တွင် လုံခြုံစွာ သိမ်းဆည်းပြီးပါပြီ။': 'Your profile was securely saved to your Daily Wage account.',
  'ဤစက်တွင် မူကြမ်းသိမ်းထားသော်လည်း Firebase သို့ မပို့နိုင်ပါ။ အမှား: {error}': 'A draft was saved on this device, but it could not be sent to Firebase. Error: {error}',
  'ရည်မှန်းချက် ထည့်ပါ': 'Enter a savings goal',
  '{months} လခန့်': 'About {months} months',
  'လစဉ်ကျန်ငွေ မလုံလောက်ပါ': 'Monthly income after expenses is not enough',
  'တောင်းဆိုမှု လက်ခံရရှိပြီး': 'Request received',
  'စစ်ဆေးနေဆဲ': 'Under review',
  'ငွေလွှဲပြီး': 'Paid',
  'ပယ်ဖျက်ပြီး · အမှတ်ပြန်အမ်းပြီး': 'Rejected · points refunded',
  'အခြေအနေ မသိရပါ': 'Unknown status'
};

let currentLanguage = 'my';
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function interpolate(template, values = {}) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

export function getLanguage() {
  return currentLanguage;
}

export function t(source, values = {}) {
  const translated = currentLanguage === 'en' ? (translations[source] || source) : source;
  return interpolate(translated, values);
}

function translateDocument(language) {
  if (typeof document === 'undefined') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let textNode;
  while ((textNode = walker.nextNode())) {
    if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue);
    const sourceText = originalText.get(textNode);
    const key = sourceText.trim();
    if (!key) continue;
    const parent = textNode.parentElement;
    const menuMy = parent?.getAttribute('data-menu-my');
    const menuEn = parent?.getAttribute('data-menu-en');
    const value = language === 'en'
      ? (menuEn ?? translations[key] ?? key)
      : (menuMy ?? key);
    const leading = sourceText.match(/^\s*/)?.[0] || '';
    const trailing = sourceText.match(/\s*$/)?.[0] || '';
    textNode.nodeValue = `${leading}${value}${trailing}`;
  }

  document.querySelectorAll('[data-menu-my-label][data-menu-en-label]').forEach(element => {
    element.setAttribute('aria-label', language === 'en'
      ? element.dataset.menuEnLabel
      : element.dataset.menuMyLabel);
  });

  const translatableAttributes = ['placeholder', 'aria-label', 'title'];
  document.querySelectorAll('*').forEach(element => {
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = new Map();
      originalAttributes.set(element, originals);
    }
    translatableAttributes.forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      if (!originals.has(attribute)) originals.set(attribute, element.getAttribute(attribute));
      const source = originals.get(attribute);
      const translated = language === 'en' ? (translations[source] || source) : source;
      element.setAttribute(attribute, translated);
    });
  });

  document.documentElement.lang = language === 'en' ? 'en' : 'my';
  document.title = language === 'en' ? 'Daily Wage App - Home' : 'နေ့စား App - ပင်မစာမျက်နှာ';
  const picker = document.getElementById('quickMenuLanguage');
  if (picker) {
    picker.value = language;
    const burmeseOption = picker.querySelector('option[value="my"]');
    if (burmeseOption) burmeseOption.textContent = language === 'en' ? 'Burmese' : 'မြန်မာ';
  }
}

export function setLanguage(language, { persist = true, announce = true } = {}) {
  currentLanguage = language === 'en' ? 'en' : 'my';
  translateDocument(currentLanguage);
  if (persist) {
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage); } catch (error) { /* Keep the selection for this page view. */ }
  }
  if (announce && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dailywage-language-changed', { detail: { language: currentLanguage } }));
  }
  return currentLanguage;
}

function loadSavedLanguage() {
  try { return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'my'; }
  catch (error) { return 'my'; }
}

setLanguage(loadSavedLanguage(), { persist: false, announce: false });
if (typeof window !== 'undefined') {
  window.dailyWageI18n = { t, getLanguage, setLanguage };
}
