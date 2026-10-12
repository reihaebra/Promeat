/* ============================================================
   ProMeat — data.js
   Mock content: store · restaurant · takeaway · account · reviews
   ============================================================ */


export const data = (function () {

  /* ---------------- shared option sets ---------------- */
  const KG = [
    { label: '۵۰۰ گرم', mult: 0.5 },
    { label: '۱ کیلوگرم', mult: 1 },
    { label: '۲ کیلوگرم', mult: 1.92 }
  ];
  const KG2 = [
    { label: '۵۰۰ گرم', mult: 0.5 },
    { label: '۱ کیلوگرم', mult: 1 }
  ];
  const CHICKEN_W = [
    { label: '۵۰۰ گرم', mult: 0.5 },
    { label: '۱ کیلوگرم', mult: 1 },
    { label: '۱٫۵ کیلوگرم', mult: 1.45 }
  ];

  const SAUCES = [
    { label: 'سس مخصوص پرومیت', mult: 0 },
    { label: 'سس سیر', mult: 0 },
    { label: 'سس تند', mult: 0 }
  ];
  const SIZES = [
    { label: 'معمولی', mult: 1 },
    { label: 'بزرگ', mult: 1.3 }
  ];
  const EXTRAS = [
    { label: 'بدون افزودنی', price: 0 },
    { label: 'پنیر اضافه', price: 35000 },
    { label: 'سیب‌زمینی اضافه', price: 45000 },
    { label: 'گوشت بیشتر', price: 79000 }
  ];

  /* ================= SECTION MAP ================= */
  const sections = [
    { id: 'store', fa: 'فروشگاه', en: 'SHOP', href: '#/store', img: 'assets/img/hero-store.jpg', icon: 'store' },
    { id: 'restaurant', fa: 'رستوران', en: 'RESTAURANT', href: '#/restaurant', img: 'assets/img/hero-restaurant.jpg', icon: 'utensils' },
    { id: 'takeaway', fa: 'بیرون‌بر', en: 'TAKE AWAY', href: '#/takeaway', img: 'assets/img/hero-takeaway.jpg', icon: 'moto' }
  ];

  /* ================= STORE ================= */
  const storeCats = [
    { id: 'beef', fa: 'گوشت', en: 'BEEF & LAMB', icon: 'drum', img: 'assets/img/st-beef-fillet.jpg',
      desc: 'گوشت گوساله و گوسفند تازه، پاک‌شده و بسته‌بندی‌شده در دمای مناسب؛ از فیله و راسته تا چرخ‌کرده و کبابی.' },
    { id: 'chicken', fa: 'مرغ', en: 'CHICKEN', icon: 'leaf', img: 'assets/img/st-chicken-breast.jpg',
      desc: 'مرغ کشتار روز بدون آنتی‌بیوتیک، شسته و آماده پخت؛ سینه، فیله، ران و بال با کیفیت یکدست.' },
    { id: 'fish', fa: 'ماهی', en: 'FISH & SEAFOOD', icon: 'fish', img: 'assets/img/st-salmon.jpg',
      desc: 'ماهی تازه دریایی و پرورشی، تمیزشده و خنک‌نشده؛ سالمون، قزل‌آلای سفید و میگوی پاک‌شده.' }
  ];

  const storeProducts = [
    /* ---- beef ---- */
    { id: 'st-01', cat: 'beef', name: 'فیله گوساله ممتاز', price: 1280000, old: 1450000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.8, reviews: 126, img: 'assets/img/st-beef-fillet.jpg', badge: 'تخفیف', pop: 92, date: 14040612,
      desc: 'فیله خالص گوساله با بافت یکدست و چربی کم؛ بهترین انتخاب برای استیک و تفت سریع.' },
    { id: 'st-02', cat: 'beef', name: 'راسته گوساله', price: 1150000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.7, reviews: 98, img: 'assets/img/st-beef-ribs.jpg', pop: 84, date: 14040530,
      desc: 'راسته با استخوان، پرطرفدار برای کباب و پخت آهسته؛ برش سفارشی پذیرفته می‌شود.' },
    { id: 'st-03', cat: 'beef', name: 'استیک ریب‌آی', price: 1690000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.9, reviews: 214, img: 'assets/img/st-steak-ribeye.jpg', badge: 'پرفروش', pop: 99, date: 14040618,
      desc: 'ریب‌آی ماربلینگ بالا، رسیده‌شده ۲۱ روزه؛ طعمی عمیق و بافتی نرم پس از گریل.' },
    { id: 'st-04', cat: 'beef', name: 'گوشت چرخ‌کرده ممتاز', price: 690000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.6, reviews: 302, img: 'assets/img/st-ground-beef.jpg', badge: 'پرفروش', pop: 96, date: 14040621,
      desc: 'ترکیب ۸۰ درصد گوشت و ۲۰ درصد چربی، چرخ دوباره برای کباب و شامی؛ تازه در روز سفارش.' },
    { id: 'st-05', cat: 'beef', name: 'گوشت خورشتی گوساله', price: 740000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.5, reviews: 87, img: 'assets/img/st-beef-stew.jpg', pop: 71, date: 14040520,
      desc: 'تکه‌های گردن و سردست برای قورمه و قیمه؛ بعد از پخت بسیار نرم و خوش‌رنگ می‌شود.' },
    { id: 'st-06', cat: 'beef', name: 'گوشت کبابی برش‌خورده', price: 980000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.8, reviews: 176, img: 'assets/img/st-kebab-meat.jpg', pop: 90, date: 14040605,
      desc: 'تکه‌های یک‌اندازه برای چنجه و کباب دنده، آماده مزه‌دار کردن؛ بدون استخوان و غشاء.' },
    { id: 'st-07', cat: 'beef', name: 'کالباس گوشت دودی', price: 420000, unit: 'هر بسته ۴۰۰ گرمی',
      weights: KG2, rating: 4.3, reviews: 64, img: 'assets/img/st-sausage.jpg', date: 14040508,
      desc: 'کالباس گوشت گاو با دود طبیعی و ادویه‌های ایرانی؛ مناسب ساندویچ و صبحانه.' },
    { id: 'st-08', cat: 'beef', name: 'چنجه گوسفندی', price: 1340000, unit: 'هر کیلوگرم',
      weights: KG, rating: 4.7, reviews: 91, img: 'assets/img/st-lamb-chops.jpg', pop: 78, date: 14040610,
      desc: 'گوشت ران گوسفند تازه با چربی کنترل‌شده؛ برای چنجه کبابی و بریان ایده‌آل است.' },

    /* ---- chicken ---- */
    { id: 'st-09', cat: 'chicken', name: 'سینه مرغ تازه', price: 320000, unit: 'هر کیلوگرم',
      weights: CHICKEN_W, rating: 4.7, reviews: 411, img: 'assets/img/st-chicken-breast.jpg', badge: 'پرفروش', pop: 98, date: 14040622,
      desc: 'سینه بدون استخوان کشتار روز، رطوبت بالا و رنگ طبیعی؛ مناسب رژیمی و ساندویچ.' },
    { id: 'st-10', cat: 'chicken', name: 'فیله مرغ', price: 395000, unit: 'هر کیلوگرم',
      weights: CHICKEN_W, rating: 4.8, reviews: 268, img: 'assets/img/st-chicken-fillet.jpg', pop: 93, date: 14040616,
      desc: 'فیله تازه مرغ، نرم و بدون رگه؛ سریع‌پخت و مناسب سوخاری و کباب.' },
    { id: 'st-11', cat: 'chicken', name: 'ران مرغ', price: 340000, unit: 'هر کیلوگرم',
      weights: CHICKEN_W, rating: 4.6, reviews: 152, img: 'assets/img/st-chicken-thigh.jpg', pop: 80, date: 14040602,
      desc: 'ران کامل با پوست، آبدار و خوش‌طعم؛ بهترین انتخاب برای پخت در فر و گریل.' },
    { id: 'st-12', cat: 'chicken', name: 'بال مرغ', price: 265000, unit: 'هر کیلوگرم',
      weights: CHICKEN_W, rating: 4.4, reviews: 118, img: 'assets/img/st-chicken-wings.jpg', date: 14040528,
      desc: 'بال مرغ تمیز و یکدست، مناسب بال کبابی و سوخاری خانگی.' },

    /* ---- fish ---- */
    { id: 'st-13', cat: 'fish', name: 'ماهی سالمون نروژی', price: 1420000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.9, reviews: 187, img: 'assets/img/st-salmon.jpg', badge: 'جدید', pop: 95, date: 14040624,
      desc: 'فیله سالمون آتلانتیک با رنگ روشن و بوی تازه؛ مناسب گریل، سوشی و پخت بخار.' },
    { id: 'st-14', cat: 'fish', name: 'فیله ماهی سفید', price: 780000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.5, reviews: 74, img: 'assets/img/st-fish-grilled.jpg', pop: 68, date: 14040518,
      desc: 'فیله بدون تیغ ماهی دریایی، بافت نرم و طعم ملایم؛ عالی برای سرخ کردن.' },
    { id: 'st-15', cat: 'fish', name: 'ماهی قزل‌آلای سردآبی', price: 890000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.7, reviews: 96, img: 'assets/img/st-trout.jpg', pop: 76, date: 14040608,
      desc: 'قزل‌آلای پرورشی با گوشت صورتی و چربی سالم؛ مناسب گریل و پخت فری.' },
    { id: 'st-16', cat: 'fish', name: 'ماهی دریایی سفید', price: 640000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.4, reviews: 58, img: 'assets/img/st-white-fish.jpg', date: 14040512,
      desc: 'ماهی سفید تازه صید روز، تمیزشده و آماده پخت؛ مناسب شکم‌پر و سرخ‌کردنی.' },
    { id: 'st-17', cat: 'fish', name: 'میگو پاک‌شده', price: 1180000, unit: 'هر کیلوگرم',
      weights: KG2, rating: 4.8, reviews: 143, img: 'assets/img/st-shrimp.jpg', badge: 'جدید', pop: 88, date: 14040620,
      desc: 'میگوی درشت پاک‌شده بدون سر و روده؛ تازه و منجمدنشده، بسته‌بندی خلأ.' }
  ];

  /* ================= RESTAURANT ================= */
  const restaurantCats = [
    { id: 'kebab', fa: 'کباب', icon: 'fire', img: 'assets/img/rs-koobideh.jpg' },
    { id: 'steak', fa: 'استیک', icon: 'drum', img: 'assets/img/rs-chelo-steak.jpg' },
    { id: 'chicken', fa: 'مرغ', icon: 'leaf', img: 'assets/img/rs-joojeh.jpg' },
    { id: 'iranian', fa: 'غذاهای ایرانی', icon: 'salad', img: 'assets/img/rs-mirza.jpg' },
    { id: 'starter', fa: 'پیش‌غذا', icon: 'salad', img: 'assets/img/rs-caesar.jpg' }
  ];

  const dishes = [
    { id: 'rs-01', cat: 'kebab', name: 'کباب کوبیده مخصوص پرومیت', price: 480000, unit: 'هر سیخ', rating: 4.9, reviews: 512,
      img: 'assets/img/rs-koobideh.jpg', badge: 'پرفروش', pop: 99, date: 14040612,
      desc: 'گوشت چرخ‌کرده تازه با پیاز داغ، زردچوبه و زعفران؛ روی ذغال داغ با نان تازه سرو می‌شود.',
      ingredients: 'گوشت گوساله، پیاز، زعفران، زردچوبه، فلفل سیاه، نان تازه' },
    { id: 'rs-02', cat: 'chicken', name: 'جوجه کباب زعفرانی', price: 520000, unit: 'هر سیخ', rating: 4.8, reviews: 468,
      img: 'assets/img/rs-joojeh.jpg', badge: 'پرفروش', pop: 97, date: 14040614,
      desc: 'تکه‌های سینه و ران مرغ در ماریناد زعفران و پیاز، کبابی‌شده با دود ملایم.',
      ingredients: 'مرغ، زعفران، پیاز، روغن زیتون، لیمو، فلفل' },
    { id: 'rs-03', cat: 'kebab', name: 'کباب برگ ممتاز', price: 610000, unit: 'هر سیخ', rating: 4.9, reviews: 331,
      img: 'assets/img/rs-barg.jpg', pop: 94, date: 14040610,
      desc: 'برگ گوساله نازک‌شده با ماریناد پیاز و زعفران؛ نرم، آبدار و کم‌چرب.',
      ingredients: 'گوشت برگ گوساله، پیاز، زعفران، کره، فلفل' },
    { id: 'rs-04', cat: 'steak', name: 'چلو استیک', price: 790000, unit: 'پرس', rating: 4.7, reviews: 194,
      img: 'assets/img/rs-chelo-steak.jpg', badge: 'جدید', pop: 89, date: 14040620,
      desc: 'استیک ریب‌آی سرخ‌شده با کره و سبزیجات، کنار برنج ایرانی و سس قارچ.',
      ingredients: 'استیک گوساله، کره، قارچ، سیب‌زمینی، برنج ایرانی' },
    { id: 'rs-05', cat: 'chicken', name: 'چلو جوجه', price: 450000, unit: 'پرس', rating: 4.6, reviews: 247,
      img: 'assets/img/rs-chelo-chicken.jpg', pop: 86, date: 14040606,
      desc: 'جوجه کبابی خردشده روی برنج ایرانی با گوجه کبابی و کره.',
      ingredients: 'جوجه کبابی، برنج ایرانی، گوجه، کره، زعفران' },
    { id: 'rs-06', cat: 'iranian', name: 'ماهی گریل', price: 680000, unit: 'پرس', rating: 4.7, reviews: 132,
      img: 'assets/img/rs-grilled-fish.jpg', pop: 82, date: 14040604,
      desc: 'فیله ماهی گریل‌شده با آبلیمو و سبزیجات تازه؛ کنار سالاد فصل.',
      ingredients: 'فیله ماهی، لیمو، سیر، روغن زیتون، سبزیجات' },
    { id: 'rs-07', cat: 'iranian', name: 'میرزاقاسمی', price: 340000, unit: 'پرس', rating: 4.5, reviews: 118,
      img: 'assets/img/rs-mirza.jpg', pop: 74, date: 14040526,
      desc: 'بادمجان کبابی با سیر و گوجه‌ی تازه؛ خوراکی سنتی و سبک با برنج.',
      ingredients: 'بادمجان، گوجه، سیر، روغن زیتون، نمک' },
    { id: 'rs-08', cat: 'iranian', name: 'کشک بادمجان', price: 310000, unit: 'پرس', rating: 4.6, reviews: 156,
      img: 'assets/img/rs-kashk.jpg', pop: 79, date: 14040524,
      desc: 'بادمجان سرخ‌شده با کشک، پیاز داغ و نعناع؛ طعم سنتی خانگی.',
      ingredients: 'بادمجان، کشک، پیاز، نعناع، گردو' },
    { id: 'rs-09', cat: 'starter', name: 'سالاد سزار', price: 290000, unit: 'پرس', rating: 4.4, reviews: 203,
      img: 'assets/img/rs-caesar.jpg', pop: 77, date: 14040602,
      desc: 'کاهوی تازه، سینه گریل‌شده مرغ، پنیر پارمزان و سس سزار خانگی.',
      ingredients: 'کاهو، مرغ گریل، پنیر پارمزان، نان تست، سس سزار' },
    { id: 'rs-10', cat: 'starter', name: 'سیب‌زمینی مخصوص', price: 240000, unit: 'پرس', rating: 4.5, reviews: 187,
      img: 'assets/img/rs-fries-loaded.jpg', pop: 83, date: 14040528,
      desc: 'سیب‌زمینی سرخ‌شده با پنیر، بیکن و سس مخصوص پرومیت.',
      ingredients: 'سیب‌زمینی، پنیر، بیکن، سس مخصوص، پیازچه' }
  ];

  /* ================= TAKEAWAY ================= */
  const takeawayCats = [
    { id: 'fried', fa: 'مرغ سوخاری', icon: 'fire', img: 'assets/img/tk-fried-spicy.jpg' },
    { id: 'doner', fa: 'دونر', icon: 'drum', img: 'assets/img/tk-doner-beef.jpg' },
    { id: 'burger', fa: 'برگر / ساندویچ', icon: 'bag', img: 'assets/img/tk-chicken-burger.jpg' },
    { id: 'chicken', fa: 'محصولات مرغی', icon: 'leaf', img: 'assets/img/tk-strips.jpg' },
    { id: 'package', fa: 'پکیج‌ها', icon: 'box', img: 'assets/img/tk-family-box.jpg' },
    { id: 'side', fa: 'پیش‌غذا', icon: 'salad', img: 'assets/img/tk-fries.jpg' }
  ];

  const takeawayProducts = [
    { id: 'tk-01', cat: 'fried', name: 'باکس مرغ سوخاری دو نفره', price: 690000, unit: 'پکیج', rating: 4.8, reviews: 342,
      img: 'assets/img/tk-box-chicken.jpg', badge: 'پرفروش', pop: 99, date: 14040622,
      desc: 'دو عدد ران سوخاری، سینه تکه‌شده، سیب‌زمینی و دو سس؛ همه در یک باکس داغ.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-02', cat: 'fried', name: 'مرغ سوخاری اسپایسی', price: 430000, unit: 'پرس', rating: 4.7, reviews: 271,
      img: 'assets/img/tk-fried-spicy.jpg', pop: 95, date: 14040616,
      desc: 'تکه‌های مرغ با پودر فلفل تند و ادویه مخصوص، سرخ‌شده تازه.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-03', cat: 'chicken', name: 'استریپس مرغ', price: 320000, unit: 'پرس', rating: 4.6, reviews: 198,
      img: 'assets/img/tk-strips.jpg', pop: 88, date: 14040612,
      desc: 'نوارهای سینه مرغ با پوشش کریسپی؛ مناسب میان‌وعده و مهمانی.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-04', cat: 'chicken', name: 'ناگتس مرغ (۱۲ عدد)', price: 265000, unit: 'بسته', rating: 4.4, reviews: 164,
      img: 'assets/img/tk-nuggets.jpg', pop: 79, date: 14040604,
      desc: 'ناگتس مرغ با پوشش طلایی و گوشت نرم؛ پخت سریع در فرایند سفارش.',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-05', cat: 'doner', name: 'دونر گوشت مخصوص', price: 380000, unit: 'ساندویچ', rating: 4.8, reviews: 256,
      img: 'assets/img/tk-doner-beef.jpg', pop: 96, date: 14040618,
      desc: 'گوشت گاو ادویه‌زده از سیخ داغ، با نان لواش و سبزیجات تازه.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-06', cat: 'doner', name: 'دونر مرغ', price: 340000, unit: 'ساندویچ', rating: 4.6, reviews: 213,
      img: 'assets/img/tk-doner-chicken.jpg', pop: 87, date: 14040608,
      desc: 'مرغ بریان ادویه‌زده با سس مخصوص و کاهوی تازه.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-07', cat: 'burger', name: 'برگر مرغ', price: 310000, unit: 'عدد', rating: 4.5, reviews: 187,
      img: 'assets/img/tk-chicken-burger.jpg', pop: 84, date: 14040602,
      desc: 'کتلت مرغ خانگی با کاهو، گوجه و سس مخصوص در نان تازه.',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-08', cat: 'burger', name: 'ساندویچ مرغ سوخاری', price: 295000, unit: 'عدد', rating: 4.6, reviews: 149,
      img: 'assets/img/tk-crispy-sandwich.jpg', pop: 81, date: 14040530,
      desc: 'تکه سوخاری کریسپی با سس قرمز و ترشی در نان برگری.',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-09', cat: 'burger', name: 'رپ مرغ', price: 330000, unit: 'عدد', rating: 4.7, reviews: 132,
      img: 'assets/img/tk-wrap.jpg', badge: 'جدید', pop: 86, date: 14040624,
      desc: 'نان نازک با مرغ گریل، سبزیجات و سس خامه‌ای؛ سبک و سیرکننده.',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-10', cat: 'package', name: 'پکیج خانوادگی', price: 1290000, unit: 'پکیج ۴ نفره', rating: 4.9, reviews: 178,
      img: 'assets/img/tk-family-box.jpg', badge: 'پرفروش', pop: 97, date: 14040620,
      desc: 'چهار ساندویچ، دو پرس سوخاری، دو سیب‌زمینی و چهار .',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-11', cat: 'package', name: 'پکیج دو نفره', price: 790000, unit: 'پکیج ۲ نفره', rating: 4.8, reviews: 204,
      img: 'assets/img/tk-duo-box.jpg', badge: 'پیشنهاد ویژه', pop: 93, date: 14040614,
      desc: 'دو ساندویچ، یک پرس استریپس، سیب‌زمینی و دو .',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-12', cat: 'package', name: 'باکس اقتصادی', price: 540000, unit: 'پکیج', rating: 4.5, reviews: 156,
      img: 'assets/img/tk-econ-box.jpg', badge: 'اقتصادی', pop: 76, date: 14040526,
      desc: 'یک ساندویچ، یک پرس ناگتس، سیب‌زمینی متوسط و .',
      opts: { sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-13', cat: 'side', name: 'سیب‌زمینی سوخاری', price: 165000, unit: 'پرس', rating: 4.5, reviews: 231,
      img: 'assets/img/tk-fries.jpg', pop: 90, date: 14040606,
      desc: 'سیب‌زمینی دستی سرخ‌شده با نمک دریایی و ادویه مخصوص.',
      opts: { sizes: SIZES, sauces: SAUCES, extras: EXTRAS } },
    { id: 'tk-14', cat: 'side', name: 'سالاد کلم', price: 145000, unit: 'پرس', rating: 4.3, reviews: 97,
      img: 'assets/img/tk-coleslaw.jpg', date: 14040518,
      desc: 'کلم رنده‌شده با سس مایونز خانگی؛ مکمل سوخاری و برگر.',
      opts: {} }
  ];

  /* ================= BRANCHES / CITIES ================= */
  const branches = [
    { id: 'b-01', fa: 'دزفول', status: 'open', active: true,
      address: 'دزفول، بلوار گلستان، نبش خیابان شهید بهشتی، مجتمع پرومیت',
      hours: 'همه‌روزه ۱۲:۰۰ تا ۲۳:۳۰', phone: '۰۶۱-۴۲۲۲۱۱۸',
      features: ['رزرو میز', 'پیش‌سفارش غذا', 'پارکینگ', 'اینترنت رایگان'], img: 'assets/img/hero-restaurant.jpg' },
    { id: 'b-02', fa: 'تهران', status: 'soon', address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، برج نور',
      hours: 'به‌زودی', phone: '۰۲۱-۹۱۰۰۲۲۴۵', features: ['رزرو میز', 'پیش‌سفارش غذا'], img: 'assets/img/rs-koobideh.jpg' },
    { id: 'b-03', fa: 'اهواز', status: 'soon', address: 'اهواز، کیان‌غربی، بلوار ساحلی',
      hours: 'به‌زودی', phone: '۰۶۱-۳۰۰۰۰۰۰', features: ['رزرو میز'], img: 'assets/img/rs-joojeh.jpg' },
    { id: 'b-04', fa: 'اصفهان', status: 'soon', address: 'اصفهان، چهارباغ پایین، خیابان سعدی',
      hours: 'به‌زودی', phone: '۰۳۱-۳۰۰۰۰۰۰', features: ['رزرو میز', 'پیش‌سفارش غذا'], img: 'assets/img/rs-barg.jpg' },
    { id: 'b-05', fa: 'شیراز', status: 'soon', address: 'شیراز، بلوار گلستان، خیابان ۱۲',
      hours: 'به‌زودی', phone: '۰۷۱-۳۰۰۰۰۰۰', features: ['رزرو میز'], img: 'assets/img/rs-chelo-steak.jpg' }
  ];

  const cities = ['تهران', 'دزفول', 'اهواز', 'اصفهان', 'شیراز'];

  const supplyPoints = [
    { t: 'کیفیت', s: 'گوشت درجه یک با شناسنامه بهداشتی' },
    { t: 'تازگی', s: 'کشتار روز و ارسال در کمتر از ۲۴ ساعت' },
    { t: 'عرضه مستقیم', s: 'بدون واسطه، از مزرعه تا در خانه شما' },
    { t: 'بسته‌بندی', s: 'بسته‌بندی خلأ و کنترل دمای زنجیره سرما' },
    { t: 'ارسال مطمئن', s: 'پیک اختصاصی با جعبه عایق‌دار' }
  ];

  const benefits = [
    { t: 'قیمت منصفانه', s: 'با بهترین کیفیت', icon: 'scale' },
    { t: 'تنوع بی‌نظیر', s: 'از معمولی تا خاص', icon: 'gem' },
    { t: 'ارسال سریع', s: 'به سراسر تهران', icon: 'truck' },
    { t: 'تضمین کیفیت', s: 'استاندارد و تازه', icon: 'shield' }
  ];

  const reservationTimes = ['۱۸:۰۰', '۱۹:۰۰', '۲۰:۰۰', '۲۱:۰۰', '۲۲:۰۰'];
  const reservationGuests = ['۱', '۲', '۳', '۴', '۵', '۶+'];

  const tables = [
    { id: 't1', name: 'میز ۱', sub: 'کنار پنجره · ۲ نفر' },
    { id: 't2', name: 'میز ۲', sub: 'کنار پنجره · ۴ نفر' },
    { id: 't3', name: 'میز ۳', sub: 'سالن اصلی · ۴ نفر' },
    { id: 't4', name: 'میز ۴', sub: 'سالن اصلی · ۶ نفر' },
    { id: 't5', name: 'میز ۵', sub: 'تراس · ۲ نفر', dis: true },
    { id: 't6', name: 'VIP ۶', sub: 'اتاق خصوصی · ۸ نفر' }
  ];

  /* ================= REVIEWS ================= */
  const reviewTexts = [
    'بسته‌بندی خیلی تمیز بود و بوی تازگی می‌داد. برای بار اول از این مغازه خریدم و قطعا دوباره سفارش می‌دم.',
    'کیفیت گوشت عالی بود، فقط اگر وزن دقیق‌تری می‌زدید عالی می‌شد. ارسال هم سریع انجام شد.',
    'قیمت نسبت به بقیه جاها مناسب‌تر بود. ران مرغ واقعا تازه بود و خوب پخته می‌شد.',
    'سفارش کمی دیرتر از زمانی که گفته بودید رسید ولی کیفیت غذا جبران کرد.',
    'چربی گوشت کمتر از حد انتظارم بود، برای رژیم عالی بود. ممنون.',
    'به نظرم بسته‌بندی خلأ واقعا حرفه‌ای بود، چیزی که از یک فروشگاه آنلاین انتظار نداشتم.',
    'کوبیده‌ها خیلی خوشمزه بودند و اندازه سیخ‌ها درست بود. جای پارک هم داشت.',
    'جوجه کباب زعفرانی بوی زعفران واقعی می‌داد. فقط نسبت به پرس، حجمش کم بود.',
    'برای مهمانی سفارش دادم و همه تعریف کردند. بسته‌بندی پکیج خانوادگی مرتب بود.',
    'سس تندش عالی بود، ولی سس سیر خیلی ملایم بود. در مجموع راضی‌ام.',
    'چند بار سفارش دادم و هر بار کیفیت یکنواخت بود؛ همین باعث شد مشتری ثابت بشم.',
    'قیمت کمی بالاست ولی واقعا پشتش کیفیت هست. ماهی تازه بود و بو نمی‌داد.',
    'با اینکه شلوغ بودم منتظر نموندم، غذا زود آمد و داغ بود.',
    'از پشتیبانی بابت یکی از اقلام سفارش کمک گرفتم و خیلی سریع جواب دادند.',
    'منوی رستوران متنوع بود و حجم غذاها مناسب بود.',
    'ارسال سریع بود و پیک خیلی محترم. فقط بسته کمی له شده بود.',
    'پوست سوخاری واقعا ترد بود و داخلش آبدار. بهترین سوخاری این محدوده.',
    'برای سفارش سازمانی همکاری کردند و فاکتور رسمی دادند. ممنون.'
  ];

  const reviewerNames = [
    'سارا محمدی', 'رضا کریمی', 'نگار احمدی', 'امیر حسینی', 'مریم رضایی',
    'بهرام نجفی', 'الهام صادقی', 'کامران تهرانی', 'زهرا قاسمی', 'پارسا مرادی',
    'فرزانه عباسی', 'مجید شریفی', 'نیلوفر اکبری', 'سینا راد', 'مهسا فتحی',
    'آرش گودرزی', 'رعنا حیدری', 'نوید کاظمی'
  ];

  const reviewDates = [
    '۲ روز پیش', '۵ روز پیش', '۱ هفته پیش', '۲ هفته پیش', '۳ هفته پیش',
    '۱ ماه پیش', '۲۵ مرداد', '۱۸ مرداد', '۹ مرداد', '۳۱ تیر'
  ];

  const featuredReviews = [
    { scope: 'restaurant', name: 'سارا محمدی', rating: 5, text: 'شب جمعه رفتیم و کوبیده و جوجه عالی بود. صف داشتند ولی با رزرو آنلاین سریع نشستیم. حتما دوباره میایم.', date: '۲ روز پیش' },
    { scope: 'restaurant', name: 'رضا کریمی', rating: 4, text: 'غذا داغ آمد و کیفیت گوشت مشخص بود. فقط سفارش ما ۲۰ دقیقه بیشتر طول کشید.', date: '۵ روز پیش' },
    { scope: 'restaurant', name: 'نگار احمدی', rating: 5, text: 'محیط تمیز و آرام بود، منوی متنوع و قیمت مناسب. ماهی گریل واقعا تازه بود.', date: '۱ هفته پیش' },
    { scope: 'restaurant', name: 'امیر حسینی', rating: 5, text: 'پیش‌سفارش کردم و موقع رسیدن میز آماده بود. هماهنگی تیم رزرو و آشپزخانه واقعا خوب بود.', date: '۲ هفته پیش' },
    { scope: 'restaurant', name: 'مریم رضایی', rating: 4, text: 'چلو جوجه خوب بود اما برنج کمی دانه‌بلندتر دوست داشتم. سرویس‌دهی عالی بود.', date: '۳ هفته پیش' },
    { scope: 'restaurant', name: 'کیانوش دهقان', rating: 3, text: 'شب پنجشنبه خیلی شلوغ بود و نیم ساعت منتظر میز ماندیم. غذا قابل قبول بود ولی نسبت به قیمت، حجم کم بود.', date: '۶ روز پیش' },
    { scope: 'restaurant', name: 'رعنا حیدری', rating: 2, text: 'رزرو ساعت ۲۰ داشتیم ولی میزمان آماده نبود و ۲۵ دقیقه معطل شدیم. با پیگیری رسیدگی کردند ولی تجربه خوبی نبود.', date: '۲ هفته پیش' },
    { scope: 'b-01', name: 'سامان قنبری', rating: 4, text: 'پارکینگ رایگان و تراس باز عالی بود. فقط صدای موسیقی کمی بلند بود.', date: '۴ روز پیش' },
    { scope: 'b-01', name: 'حدیث نوروزی', rating: 3, text: 'رفتار پرسنل محترمانه بود، اما سفارش پیش‌سفارش ما کمی دیر آمد.', date: '۱ هفته پیش' },
    { scope: 'b-01', name: 'کامران تهرانی', rating: 5, text: 'شعبه دزفول برای شام خانوادگی ایده‌آل بود؛ هم فضای باز داشت هم سرویس سریع. رزرو آنلاین هم بدون معطلی انجام شد.', date: '۳ روز پیش' },
    { scope: 'rs-01', name: 'بهرام نجفی', rating: 5, text: 'کوبیده‌ی پرومیت واقعا بوی ذغال می‌داد و چربیش درست بود. بهترین کوبیده‌ای بود که خوردم.', date: '۳ روز پیش' },
    { scope: 'rs-01', name: 'الهام صادقی', rating: 5, text: 'دو سیخ سفارش دادم، هر دو داغ و آبدار رسید. نان تازه هم کنارش عالی بود.', date: '۱ هفته پیش' },
    { scope: 'rs-01', name: 'نوید کاظمی', rating: 3, text: 'کوبیده قابل قبول بود ولی نان دیر آمد و کمی سرد شد. امیدوارم اصلاح شود.', date: '۵ روز پیش' },
    { scope: 'rs-02', name: 'کامران تهرانی', rating: 4, text: 'جوجه زعفرانی بوی خوبی داشت، فقط سیخ‌ها نسبت به قیمت کوچک بود.', date: '۴ روز پیش' },
    { scope: 'rs-04', name: 'زهرا قاسمی', rating: 5, text: 'چلو استیک با سس قارچ ترکیب بی‌نقصی بود. استیک دقیقا به اندازه‌ای پخته بود که خواستم.', date: '۶ روز پیش' },
    { scope: 'st-01', name: 'پارسا مرادی', rating: 5, text: 'فیله بدون هیچ چربی اضافه بود و بافت یکدست. برای استیک سرخ کردیم و فوق‌العاده شد.', date: '۱ روز پیش' },
    { scope: 'st-01', name: 'فرزانه عباسی', rating: 4, text: 'کیفیت خوب، فقط بسته کمی سردتر از حد انتظار رسید. بقیه‌چیزها عالی بود.', date: '۱۰ روز پیش' },
    { scope: 'st-01', name: 'سینا راد', rating: 3, text: 'بافت گوشت خوب بود اما وزن بسته کمی کمتر از مقدار سفارش بود. پیگیری کردم و اختلاف را برگرداندند.', date: '۱۲ روز پیش' },
    { scope: 'st-03', name: 'مجید شریفی', rating: 5, text: 'ریب‌آی با ماربلینگ بالا واقعا حرفه‌ای بود. ارزش هر تومانش را داشت.', date: '۲ روز پیش' },
    { scope: 'st-09', name: 'نیلوفر اکبری', rating: 5, text: 'سینه مرغ کشتار روز بود و بوی تازگی می‌داد. برای رژیم هفتگی مناسب است.', date: '۴ روز پیش' },
    { scope: 'st-13', name: 'سینا راد', rating: 5, text: 'سالمون رنگ روشن و تازه داشت، هیچ بوی نامطبوعی نداشت. بسته‌بندی هم حرفه‌ای بود.', date: '۳ روز پیش' },
    { scope: 'tk-01', name: 'مهسا فتحی', rating: 5, text: 'پکیج دو نفره برای شام عالی بود. سوخاری ترد و سس تندش عالی.', date: '۲ روز پیش' },
    { scope: 'tk-01', name: 'پارسا مرادی', rating: 3, text: 'سوخاری ترد بود ولی سس کافی نبود و برای دو نفر کم آمد. بسته‌بندی تمیز بود.', date: '۹ روز پیش' },
    { scope: 'tk-05', name: 'رعنا حیدری', rating: 5, text: 'دونر گوشت خیلی خوشمزه بود و نانش تازه. سریع هم آماده شد.', date: '۵ روز پیش' },
    { scope: 'tk-10', name: 'نوید کاظمی', rating: 5, text: 'پکیج خانوادگی برای جمع ۴ نفره کامل بود و همه‌چیز داغ رسید.', date: '۶ روز پیش' }
  ];

  /* ================= MOCK ACCOUNT DATA ================= */
  const mockOrders = [
    { id: 'PM-10482', date: '۲۶ مرداد ۱۴۰۴', status: 'processing', total: 1845000, ship: 'ارسال سریع',
      items: [
        { name: 'فیله گوساله ممتاز', qty: 1, price: 1280000, img: 'assets/img/st-beef-fillet.jpg' },
        { name: 'سینه مرغ تازه', qty: 1, price: 320000, img: 'assets/img/st-chicken-breast.jpg' },
        { name: 'سیب‌زمینی سوخاری', qty: 1, price: 165000, img: 'assets/img/tk-fries.jpg' }
      ] },
    { id: 'PM-10461', date: '۲۳ مرداد ۱۴۰۴', status: 'ready', total: 960000, ship: 'ارسال عادی',
      items: [
        { name: 'گوشت کبابی برش‌خورده', qty: 1, price: 980000, img: 'assets/img/st-kebab-meat.jpg' }
      ] },
    { id: 'PM-10407', date: '۱۵ مرداد ۱۴۰۴', status: 'shipped', total: 2310000, ship: 'ارسال سریع',
      items: [
        { name: 'ماهی سالمون نروژی', qty: 1, price: 1420000, img: 'assets/img/st-salmon.jpg' },
        { name: 'چنجه گوسفندی', qty: 1, price: 890000, img: 'assets/img/st-lamb-chops.jpg' }
      ] },
    { id: 'PM-10355', date: '۴ مرداد ۱۴۰۴', status: 'delivered', total: 740000, ship: 'ارسال عادی',
      items: [
        { name: 'گوشت چرخ‌کرده ممتاز', qty: 1, price: 690000, img: 'assets/img/st-ground-beef.jpg' }
      ] }
  ];

  const mockReservations = [
    { id: 'RS-2481', num: '۲۴۸۱', branch: 'دزفول', day: '۲۸', month: 'مرداد', dateFull: '۲۸ مرداد ۱۴۰۴',
      time: '۲۰:۰۰', guests: '۴', table: 'میز ۳', status: 'confirmed',
      food: [{ name: 'کباب کوبیده مخصوص پرومیت', qty: 2 }, { name: 'جوجه کباب زعفرانی', qty: 1 }] },
    { id: 'RS-2402', num: '۲۴۰۲', branch: 'دزفول', day: '۹', month: 'مرداد', dateFull: '۹ مرداد ۱۴۰۴',
      time: '۲۱:۰۰', guests: '۲', table: 'میز ۱', status: 'done',
      food: [{ name: 'چلو استیک', qty: 1 }] },
    { id: 'RS-2377', num: '۲۳۷۷', branch: 'دزفول', day: '۲', month: 'مرداد', dateFull: '۲ مرداد ۱۴۰۴',
      time: '۱۹:۰۰', guests: '۶', table: 'میز ۴', status: 'cancelled', food: [] }
  ];

  const mockAddresses = [
    { id: 'ad-1', title: 'خانه', name: 'علی رضایی', phone: '۰۹۱۲۱۲۳۴۵۶۷',
      state: 'تهران', city: 'تهران', postal: '۱۹۹۸۷۴۵۶۳۲', plaque: '۱۸', unit: '۴',
      text: 'تهران، سعادت‌آباد، خیابان علامه شمالی، کوچه ۱۲، پلاک ۱۸، واحد ۴' },
    { id: 'ad-2', title: ' محل کار', name: 'علی رضایی', phone: '۰۲۱۸۸۷۷۶۵۴۳',
      state: 'تهران', city: 'تهران', postal: '۱۵۶۷۸۴۳۲۱۰', plaque: '۲۷۰', unit: '۹',
      text: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، برج نور، طبقه ۹، واحد ۲۷۰' },
    { id: 'ad-3', title: 'خانه پدری', name: 'علی رضایی', phone: '۰۹۱۲۵۵۵۹۸۷۶',
      state: 'خوزستان', city: 'دزفول', postal: '۶۴۶۱۹۸۷۴۵۳', plaque: '۷', unit: '۱',
      text: 'دزفول، بلوار گلستان، کوچه شهید بهشتی ۳، پلاک ۷، طبقه همکف' },
    { id: 'ad-4', title: 'دفتر', name: 'علی رضایی', phone: '۰۲۱۹۱۰۰۲۲۴۵',
      state: 'تهران', city: 'تهران', postal: '۱۹۶۷۸۴۳۲۱۰', plaque: '۴۵', unit: '۲',
      text: 'تهران، سعادت‌آباد، بلوار فردوس، نبش خیابان گلستان، پلاک ۴۵، واحد ۲' }
  ];

  /* ---------------- helpers ---------------- */
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function reviewsFor(scope) {
    const fixed = featuredReviews.filter(r => r.scope === scope);
    if (fixed.length) return fixed;
    const h = hash(scope);
    const count = 3 + (h % 2);
    const out = [];
    for (let i = 0; i < count; i++) {
      const idx = (h + i * 7) % reviewTexts.length;
      const t = (h + i * 3) % 10;
      out.push({
        name: reviewerNames[(h + i * 5) % reviewerNames.length],
        rating: t < 5 ? 5 : t < 8 ? 4 : t === 8 ? 3 : 2,
        text: reviewTexts[idx],
        date: reviewDates[(h + i * 3) % reviewDates.length]
      });
    }
    return out;
  }

  /* rating distribution from a single score (deterministic) */
  function distribution(score) {
    const d = [
      Math.round((score - 3.6) * 62),
      Math.round((score - 4.1) * 46),
      18,
      7,
      4
    ].map(v => Math.max(3, v));
    const total = d.reduce((a, b) => a + b, 0);
    return { five: Math.round(d[0] / total * 100), four: Math.round(d[1] / total * 100),
             three: Math.round(d[2] / total * 100), two: Math.round(d[3] / total * 100),
             one: Math.round(d[4] / total * 100) };
  }

  function byId(list, id) { return list.find(x => x.id === id) || null; }

  const searchIndex = (function () {
    const rows = [];
    storeProducts.forEach(p => rows.push({ id: p.id, type: 'store', name: p.name, cat: 'فروشگاه · ' + (storeCats.find(c => c.id === p.cat) || {}).fa,
      price: p.price, rating: p.rating, img: p.img, href: '#/p/' + p.id, hay: p.name + ' ' + p.desc + ' گوشت مرغ ماهی' }));
    dishes.forEach(p => rows.push({ id: p.id, type: 'restaurant', name: p.name, cat: 'رستوران · ' + (restaurantCats.find(c => c.id === p.cat) || {}).fa,
      price: p.price, rating: p.rating, img: p.img, href: '#/restaurant/dish/' + p.id, hay: p.name + ' ' + p.desc + ' غذا رستوران کباب' }));
    takeawayProducts.forEach(p => rows.push({ id: p.id, type: 'takeaway', name: p.name, cat: 'بیرون‌بر · ' + (takeawayCats.find(c => c.id === p.cat) || {}).fa,
      price: p.price, rating: p.rating, img: p.img, href: '#/tk/' + p.id, hay: p.name + ' ' + p.desc + ' سوخاری دونر برگر' }));
    return rows;
  })();

  return {
    sections, storeCats, storeProducts,
    restaurantCats, dishes,
    takeawayCats, takeawayProducts,
    branches, cities, supplyPoints, benefits,
    reservationTimes, reservationGuests, tables,
    reviewTexts, reviewerNames, reviewDates, featuredReviews,
    mockOrders, mockReservations, mockAddresses,
    searchIndex,
    reviewsFor, distribution, byId,
    hash,
    _statusFa: function (s) {
      return { processing: 'در حال پردازش', ready: 'آماده ارسال', shipped: 'ارسال شده', delivered: 'تحویل داده شده' }[s] || s;
    },
    _resvFa: function (s) {
      return { confirmed: 'تایید شده', done: 'انجام شده', cancelled: 'لغو شده' }[s] || s;
    }
  };
})();
