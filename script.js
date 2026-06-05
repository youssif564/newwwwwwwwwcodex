const WHATSAPP_NUMBER = "201220597999";
const EMAILJS_SERVICE_ID = "service_h606on5";
const EMAILJS_TEMPLATE_ID = "template_8q3hewi";
const EMAILJS_PUBLIC_KEY = "RF_jwuITFQBc71jg5";

const IMG_BASE = "https://www.modosmartwallets.com/";

const DELIVERY_REGIONS = {
  cairo_giza: { ar: "القاهرة والجيزة", en: "Cairo & Giza", fee: 99 },
  alex: { ar: "الإسكندرية", en: "Alexandria", fee: 120 },
  delta_canal: { ar: "الدلتا والقناة", en: "Delta & Canal", fee: 125 },
  assiut: { ar: "أسيوط", en: "Assiut", fee: 200 },
  northcoast: { ar: "الساحل الشمالي", en: "North Coast", fee: 220 }
};

let currentLang = localStorage.getItem("modoLang") || "ar";
let selectedProductId = "smart";
let selectedDeliveryRegion = "cairo_giza";
let checkoutCartMode = new URLSearchParams(window.location.search).get("cart") === "1";
let reviewsExpanded = false;
let latestReviewsData = [];
let liveReviewsDb = null;
let liveReviewsEnabled = false;

const PRODUCT_PAGE_PATHS = {
  smart: "./smart-wallet.html",
  classic: "./classic-wallet.html",
  premium: "./premium-wallet.html"
};

function isCheckoutPage() {
  return document.body.classList.contains("checkout-page") || location.pathname.toLowerCase().endsWith("checkout.html");
}

const firebaseConfigLiveReviews = {
  apiKey: "AIzaSyDJF6D0MrFt8TsXsMcTpu8EqVp0deRh9aQ",
  authDomain: "modo-smart-wallets.firebaseapp.com",
  projectId: "modo-smart-wallets",
  storageBucket: "modo-smart-wallets.firebasestorage.app",
  messagingSenderId: "229690155538",
  appId: "1:229690155538:web:4ec04258e5880485892ecb",
  measurementId: "G-H402HQ36YF"
};

const CLOUDINARY_CLOUD_NAME = "di3fqqtn1";
const CLOUDINARY_UPLOAD_PRESET = "modosmartwallets";

const products = [
  {
    id: "smart",
    oldPrice: 799,
    price: 650,
    image: `${IMG_BASE}smart-wallet.jpg`,
    featured: true,
    ar: {
      name: "Modo Smart Wallet",
      tag: "ضد الضياع",
      desc: "الموديل الأساسي للحماية اليومية: جلد طبيعي 100%، تتبع، تنبيه عند الابتعاد، وصوت إنذار.",
      features: ["جلد طبيعي 100%", "تتبع ضد الفقد", "تنبيه عند الابتعاد", "صوت إنذار للعثور عليها", "بطارية قابلة للتغيير"]
    },
    en: {
      name: "Modo Smart Wallet",
      tag: "Anti-loss",
      desc: "The everyday protection model: 100% natural leather, tracking, out-of-range alert, and alarm sound.",
      features: ["100% natural leather", "Anti-loss tracking", "Out-of-range alert", "Alarm sound finder", "Replaceable battery"]
    }
  },
  {
    id: "classic",
    oldPrice: 499,
    price: 399,
    image: `${IMG_BASE}classic-wallet.jpg`,
    featured: false,
    ar: {
      name: "Modo Classic Wallet",
      tag: "كلاسيك",
      desc: "محفظة جلد طبيعي 100% كلاسيكية بدون تتبع، لشكل أنيق واستخدام يومي نظيف.",
      trackerNote: "بدون تتبع",
      features: ["جلد طبيعي 100%", "بدون تتبع", "تصميم كلاسيكي", "خياطة عالية الجودة", "مناسبة للاستخدام اليومي", "شكل احترافي"]
    },
    en: {
      name: "Modo Classic Wallet",
      tag: "Classic",
      desc: "A clean 100% natural leather wallet without tracker, for elegant everyday carry.",
      trackerNote: "Without tracker",
      features: ["100% natural leather", "No tracker", "Classic design", "Premium stitching", "Daily use", "Professional look"]
    }
  },
  {
    id: "premium",
    oldPrice: 1999,
    price: 1500,
    image: `${IMG_BASE}premium-wallet.jpg`,
    featured: false,
    ar: {
      name: "Modo Premium Wallet",
      tag: "فاخر",
      desc: "نسخة أفخم بحجم أصغر، فيها تتبع ذكي، إغلاق مغناطيسي، شحن كل 3 شهور تقريبًا، وتوصيل مجاني.",
      trackerNote: "فيها تتبع ذكي",
      features: ["تتبع ذكي ضد الفقد", "حجم أصغر وأكثر فخامة", "منفذ شحن داخل العلبة", "بطارية حتى 3 شهور تقريبًا", "إغلاق مغناطيسي محكم"],
      moreTitle: "تفاصيل Premium",
      moreText: "يأتي الموديل البريميوم في علبة فاخرة، مع تتبع ضد الفقد وتنبيه عند الابتعاد وتشطيب مناسب كهدية.",
      moreFeatures: ["جلد طبيعي 100%", "تتبع ضد الفقد وتنبيه عند الابتعاد", "تشطيب فاخر", "توصيل مجاني"]
    },
    en: {
      name: "Modo Premium Wallet",
      tag: "Premium",
      desc: "A smaller luxury version with smart tracking, magnetic closure, around 3 months per charge, and free delivery.",
      trackerNote: "Smart tracker included",
      features: ["Smart anti-loss tracking", "Smaller premium size", "Charging port included", "Up to around 3 months per charge", "Secure magnetic closure"],
      moreTitle: "Premium details",
      moreText: "The Premium model comes in a luxury box, with anti-loss tracking, out-of-range alerts, and a refined finish for gifting.",
      moreFeatures: ["100% natural leather", "Anti-loss tracking and alerts", "Luxury finish", "Free delivery"]
    }
  }
];

const PRODUCT_COPY_UPDATES = {
  smart: {
    ar: {
      desc: "راحة بال يومية في محفظة جلد طبيعي 100%: تتبع بالموبايل، تنبيه عند الابتعاد، وصوت يساعدك تلاقيها بسرعة.",
      features: ["جلد طبيعي 100%", "تتبع بالموبايل", "تنبيه عند الابتعاد", "صوت إنذار", "بطارية قابلة للتغيير"]
    },
    en: {
      desc: "Daily peace of mind in 100% natural leather: phone tracking, distance alerts, and a sound finder when you need it.",
      features: ["100% natural leather", "Phone tracking", "Out-of-range alert", "Alarm sound finder", "Replaceable battery"]
    }
  },
  classic: {
    ar: {
      desc: "ستايل جلد طبيعي 100% نظيف وبسيط للاستخدام اليومي، بدون تتبع.",
      trackerNote: "بدون تتبع",
      features: ["جلد طبيعي 100%", "بدون تتبع", "تصميم كلاسيكي", "خياطة نظيفة", "استخدام يومي"]
    },
    en: {
      desc: "A clean 100% natural leather wallet for simple everyday carry, without tracker.",
      trackerNote: "Without tracker",
      features: ["100% natural leather", "No tracker", "Classic design", "Clean stitching", "Everyday use"]
    }
  },
  premium: {
    ar: {
      desc: "إحساس فاخر يصلح كهدية: جلد طبيعي 100%، تتبع ذكي، إغلاق مغناطيسي، وتوصيل مجاني.",
      trackerNote: "فيها تتبع ذكي",
      features: ["تتبع ذكي", "جلد طبيعي 100%", "تشطيب فاخر", "إغلاق مغناطيسي", "توصيل مجاني"],
      moreText: "يأتي الموديل البريميوم في علبة فاخرة، مع تتبع ضد الفقد وتنبيه عند الابتعاد وتشطيب مناسب كهدية.",
      moreFeatures: ["جلد طبيعي 100%", "تتبع وتنبيه ضد الفقد", "إحساس فاخر", "توصيل مجاني"]
    },
    en: {
      desc: "A gift-worthy luxury finish: 100% natural leather, smart tracking, magnetic closure, and free delivery.",
      trackerNote: "Smart tracker included",
      features: ["Smart tracking", "100% natural leather", "Luxury finish", "Magnetic closure", "Free delivery"],
      moreText: "The Premium model arrives in a refined box with anti-loss tracking, out-of-range alerts, and a finish made for gifting.",
      moreFeatures: ["100% natural leather", "Anti-loss tracking and alerts", "Luxury finish", "Free delivery"]
    }
  }
};

products.forEach(product => {
  const update = PRODUCT_COPY_UPDATES[product.id];
  if (!update) return;
  product.ar = { ...product.ar, ...update.ar };
  product.en = { ...product.en, ...update.en };
});

const translations = {
  ar: {
    topOffer: "عرض إطلاق لأول 25 قطعة فقط — شحن سريع والدفع عند الاستلام داخل مصر",
    brandAntiLoss: "ضد الضياع", brandSafe: "طلب آمن", brandLeather: "100% جلد طبيعي",
    navProducts: "المنتجات", navAbout: "عن مودو", navStory: "قصتنا", navWhy: "ليه تختار مودو", navHow: "طريقة الاستخدام", navReviews: "التقييمات", navFAQ: "الأسئلة", navCTA: "اطلب الآن",
    heroKicker: "MODO Wallet Egypt", launchOfferStrong: "وفر حتى 499 جنيه", launchOfferText: "عرض إطلاق محدود لأول 25 قطعة", heroTitle: "محفظة ضد الضياع من جلد طبيعي 100%", heroSubtitle: "جلد طبيعي 100%، تتبع بالموبايل، وتنبيه يساعدك تلاقيها بسرعة.", heroCTA: "اطلب الآن", heroExplore: "شوف المحافظ",
    signal1Title: "ضد الضياع", signal1Text: "تنبيه عند الابتعاد", signal2Title: "طلب آمن", signal2Text: "الدفع عند الاستلام", signal3Title: "جلد طبيعي 100%", signal3Text: "خامة فاخرة", heroChipSmall: "المحفظة آمنة", heroChipStrong: "متصلة",
    identity1Title: "مصممة ضد الضياع", identity1Text: "المحفظة مش مجرد شكل. الفكرة الأساسية إنك تاخد تنبيه وتقدر تخليها ترن لما تختفي.", identity2Title: "طلب أكثر أمانًا", identity2Text: "الدفع عند الاستلام، تأكيد واتساب، واستبدال 7 أيام في حالة عيب تصنيع.", identity3Title: "جلد طبيعي 100%", identity3Text: "جلد طبيعي 100% وتشطيب هادي يناسب الشغل، الخروج، والهدايا.",
    ugcEyebrow: "تجربة حقيقية", ugcTitle: "شوف الإحساس قبل ما تطلب", ugcText: "فيديو قصير يوضح شكل المحفظة واستخدام فكرة التتبع من غير شرح زيادة.",
    productsEyebrow: "مجموعة MODO", productsTitle: "اختار درجة الحماية والفخامة", productsSubtitle: "كل موديل له نفس روح MODO: شكل نظيف، طلب آمن، وتجربة يومية أهدى.", chooseProduct: "اطلب الآن", readMoreProduct: "اقرأ المزيد", premiumFreeDelivery: "توصيل مجاني", saveLabel: "وفر", productCODLine: "الدفع عند الاستلام", productDeliveryLine: "شحن سريع داخل مصر",
    purchaseNoteCOD: "الدفع عند الاستلام", purchaseNoteDelivery: "توصيل 24–72 ساعة", purchaseNoteReplace: "استبدال 7 أيام لعيب التصنيع", trustMetricRating: "تقييم العملاء", trustMetricCustomers: "عميل داخل مصر", trustMetricCOD: "الدفع عند الاستلام", trustMetricDelivery: "توصيل سريع",
    reviewsEyebrow: "آراء العملاء", reviewsTitle: "ثقة حقيقية مش كلام كتير", reviewsSubtitle: "كل التقييمات ظاهرة، ومعاها الصور لو العميل رفع صورة للمنتج.", latestReviews: "كل التقييمات", viewAllReviews: "عرض كل التقييمات", showLessReviews: "عرض أقل", writeReviewTitle: "اكتب تقييمك",
    reviewNameLabel: "الاسم", reviewCityLabel: "المدينة", reviewRatingLabel: "التقييم", reviewTextLabel: "رأيك في المنتج", reviewImageLabel: "صورة اختيارية للمنتج", submitReview: "نشر التقييم مباشرة", reviewStatusReady: "التقييم سيظهر مباشرة بعد النشر.",
    conversionBandEyebrow: "عرض الإطلاق", conversionBandTitle: "اختار محفظتك الآن وادفع عند الاستلام", conversionBandText: "السعر الحالي لفترة محدودة، والتأكيد بيتم على واتساب قبل الشحن.", conversionBandCTA: "كمّل الطلب",
    orderEyebrow: "اطلب بأمان", orderTitle: "بيانات الطلب", orderSubtitle: "هنفتح واتساب فورًا لتأكيد الطلب.", orderUrgency: "العرض الحالي محدود. احجز السعر قبل انتهاء أول 25 قطعة.", selectedLabel: "الموديل المختار", formProduct: "اختار المنتج", formName: "الاسم", formPhone: "رقم الموبايل", formAddress: "العنوان بالتفصيل", formDeliveryRegion: "منطقة التوصيل", formPayment: "طريقة الدفع", formNotes: "ملاحظات اختيارية", paymentCOD: "الدفع عند الاستلام", submitOrder: "إرسال الطلب", orderSuccess: "تم تأكيد طلبك", formNote: "بياناتك تستخدم لتأكيد الطلب فقط.", checkoutStepDetails: "بياناتك", checkoutStepDelivery: "التوصيل والدفع", checkoutStepConfirm: "تأكيد واتساب", checkoutProductTitle: "الموديل المختار", checkoutCustomerTitle: "بيانات العميل", checkoutDeliveryTitle: "التوصيل والدفع", checkoutReviewTitle: "مراجعة الطلب", checkoutConfirmNote: "بعد الضغط، هيفتح واتساب برسالة الطلب جاهزة للتأكيد.",
    deliveryCairoGiza: "القاهرة والجيزة — 99 جنيه", deliveryAlex: "الإسكندرية — 120 جنيه", deliveryDeltaCanal: "الدلتا والقناة — 125 جنيه", deliveryAssiut: "أسيوط — 200 جنيه", deliveryNorthCoast: "الساحل الشمالي — 220 جنيه", checkoutTotalLabel: "إجمالي السعر شامل التوصيل", premiumFreeDeliveryCheckout: "توصيل مجاني مع Modo Premium Wallet",
    footerAbout: "محافظ جلد طبيعي 100% ضد الضياع بإحساس آمن وفاخر.", footerContact: "التواصل", footerSocial: "تابعنا", copyright: "© 2026 Modo Smart Wallets. جميع الحقوق محفوظة.", stickyCTA: "اطلب الآن",
    pageTopStrip: "ضد الضياع / طلب آمن / جلد طبيعي 100%",
    storyPageKicker: "قصة MODO", storyPageHeroTitle: "بدأت من مشكلة حقيقية", storyPageHeroText: "محفظة ضاعت، وحاجة واضحة لمنتج شكله فاخر وفي نفس الوقت يحميك من القلق اليومي. من هنا ظهر MODO: جلد طبيعي 100%، حماية ضد الفقد، وطلب آمن داخل مصر.",
    storyFullEyebrow: "قصتنا",
    storyFullTitle: "الموضوع مبدأش كـ بيزنس... بدأ من مشكلة حقيقية.",
    storyFullP1: "أنا يوسف رشوان. في يوم من الأيام، ضاعت محفظتي بكل اللي فيها: كروت، فلوس، وحاجات مهمة.",
    storyFullP2: "الموقف ده خلاني أفهم قد إيه إحنا معتمدين على حاجة بسيطة زي المحفظة، ومع ذلك مفيش حماية حقيقية ليها.",
    storyFullP3: "ومن هنا بدأت الفكرة: ليه مايبقاش فيه محفظة شكلها فاخر، وفي نفس الوقت تساعدك تحس بالأمان؟",
    storyFullFeature1: "تصميم فاخر يناسب ستايلك",
    storyFullFeature2: "جلد طبيعي عالي الجودة",
    storyFullFeature3: "تكنولوجيا ذكية تساعدك تلاقيها لو ضاعت",
    storyFullHighlight: "MODO مش مجرد محفظة: دي حماية يومية، تصميم فاخر، وجودة تعيش معاك.",
    storyFullNote: "إحنا مش شركة كبيرة مجهولة. إحنا ناس حقيقيين في مصر، بنبني منتج يعيش معاك.",
    storyCard1Title: "جلد طبيعي 100%", storyCard1Text: "الخامة جزء من الهوية، مش مجرد وصف للمنتج.", storyCard2Title: "حماية ضد الضياع", storyCard2Text: "تتبع، تنبيه عند الابتعاد، وصوت إنذار يساعدك تلاقيها.", storyCard3Title: "شراء مطمئن", storyCard3Text: "الدفع عند الاستلام وتأكيد واتساب قبل الشحن.",
    whyPageKicker: "ليه MODO", whyPageHeroTitle: "شراء آمن وتجربة فاخرة", whyPageHeroText: "الفرق في MODO مش ميزة واحدة. هو خليط واضح: جلد طبيعي 100%، حماية ضد الضياع، ودفع عند الاستلام.",
    whyCard1Title: "الدفع عند الاستلام", whyCard1Text: "ادفع لما تستلم، مع تأكيد الطلب على واتساب قبل الشحن.", whyCard2Title: "تنبيه وصوت إنذار", whyCard2Text: "المحفظة تساعدك تلاحظ الابتعاد وتلاقيها لو اختفت قريب منك.", whyCard3Title: "جلد طبيعي 100%", whyCard3Text: "شكل هادي وخامة مناسبة للاستخدام اليومي والهدايا.",
    howPageKicker: "طريقة الاستخدام", howPageHeroTitle: "تشغيل بسيط، حماية يومية", howPageHeroText: "الفكرة كلها إن المحفظة تبقى مرتبطة بالموبايل، فتعرف تتنبه أو تشغل صوت لما تحتاجها.",
    howCard1Title: "حمّل التطبيق", howCard1Text: "استخدم تطبيق iSearching على iOS أو Android.", howCard2Title: "وصل المحفظة", howCard2Text: "ضغطة مطولة على حرف M، وبعدها اضغط Connect داخل تطبيق iSearching.", howCard3Title: "استقبل التنبيهات", howCard3Text: "تنبيه عند الابتعاد وصوت إنذار للعثور عليها.",
    faqPageKicker: "الأسئلة", faqPageHeroTitle: "أسئلة قبل الطلب", faqPageHeroText: "إجابات مختصرة على أهم الحاجات اللي تهمك قبل ما تختار MODO.",
    faqCard1Title: "هل الجلد طبيعي؟", faqCard1Text: "نعم، محافظ MODO مصنوعة من جلد طبيعي 100% بتشطيب فاخر.", faqCard2Title: "هل هي بديل AirTag؟", faqCard2Text: "ليست AirTag من Apple، لكنها تقدم تجربة عملية للتتبع والتنبيه عبر الهاتف.", faqCard3Title: "هل يوجد دفع عند الاستلام؟", faqCard3Text: "نعم، الدفع عند الاستلام متاح داخل مصر مع تأكيد واتساب قبل الشحن."
  },
  en: {
    topOffer: "Launch offer for the first 25 pieces only — fast delivery and Cash on Delivery in Egypt",
    brandAntiLoss: "Anti-loss", brandSafe: "Safe order", brandLeather: "100% Leather",
    navProducts: "Products", navAbout: "About Modo", navStory: "Our Story", navWhy: "Why Modo", navHow: "How it works", navReviews: "Reviews", navFAQ: "FAQ", navCTA: "Order now",
    heroKicker: "MODO Wallet Egypt", launchOfferStrong: "Save up to 499 EGP", launchOfferText: "Limited launch offer for the first 25 pieces", heroTitle: "Anti-loss wallet made from 100% natural leather", heroSubtitle: "100% natural leather with mobile tracking and alerts to find it fast.", heroCTA: "Order now", heroExplore: "View wallets",
    signal1Title: "Anti-loss", signal1Text: "Out-of-range alert", signal2Title: "Safe order", signal2Text: "Cash on Delivery", signal3Title: "100% Leather", signal3Text: "100% natural leather", heroChipSmall: "Wallet secured", heroChipStrong: "Connected",
    identity1Title: "Anti-loss by design", identity1Text: "The wallet is not just about looks. It is made to alert you and ring when it disappears.", identity2Title: "Safer checkout", identity2Text: "Cash on Delivery, WhatsApp confirmation, and 7-day replacement for manufacturing defects.", identity3Title: "100% Natural Leather", identity3Text: "100% natural leather with a quiet finish for work, daily outings, and gifting.",
    ugcEyebrow: "Real demo", ugcTitle: "See the feel before ordering", ugcText: "A short video showing the wallet and the tracking idea without overexplaining it.",
    productsEyebrow: "MODO Collection", productsTitle: "Choose your protection and finish", productsSubtitle: "Every model keeps the MODO spirit: clean look, safe order, calmer daily carry.", chooseProduct: "Order now", readMoreProduct: "Read more", premiumFreeDelivery: "Free delivery", saveLabel: "Save", productCODLine: "Cash on Delivery", productDeliveryLine: "Fast delivery in Egypt",
    purchaseNoteCOD: "Cash on Delivery", purchaseNoteDelivery: "24–72h delivery", purchaseNoteReplace: "7-day defect replacement", trustMetricRating: "Customer rating", trustMetricCustomers: "Customers in Egypt", trustMetricCOD: "Cash on Delivery", trustMetricDelivery: "Fast delivery",
    reviewsEyebrow: "Customer reviews", reviewsTitle: "Real trust, less noise", reviewsSubtitle: "All reviews are visible, including product photos when customers upload them.", latestReviews: "All reviews", viewAllReviews: "View all reviews", showLessReviews: "Show less", writeReviewTitle: "Write your review",
    reviewNameLabel: "Name", reviewCityLabel: "City", reviewRatingLabel: "Rating", reviewTextLabel: "Your review", reviewImageLabel: "Optional product photo", submitReview: "Publish review live", reviewStatusReady: "Your review will appear after publishing.",
    conversionBandEyebrow: "Launch offer", conversionBandTitle: "Choose your wallet now and pay on delivery", conversionBandText: "Current pricing is limited, and your order is confirmed on WhatsApp before shipping.", conversionBandCTA: "Complete order",
    orderEyebrow: "Order safely", orderTitle: "Order details", orderSubtitle: "WhatsApp opens immediately to confirm your order.", orderUrgency: "The current offer is limited. Reserve the price before the first 25 pieces end.", selectedLabel: "Selected model", formProduct: "Choose product", formName: "Name", formPhone: "Phone number", formAddress: "Detailed address", formDeliveryRegion: "Delivery area", formPayment: "Payment method", formNotes: "Optional notes", paymentCOD: "Cash on Delivery", submitOrder: "Send order", orderSuccess: "Your order is confirmed", formNote: "Your details are used only to confirm the order.", checkoutStepDetails: "Your details", checkoutStepDelivery: "Delivery & payment", checkoutStepConfirm: "WhatsApp confirm", checkoutProductTitle: "Selected model", checkoutCustomerTitle: "Customer details", checkoutDeliveryTitle: "Delivery & payment", checkoutReviewTitle: "Order review", checkoutConfirmNote: "After pressing, WhatsApp opens with your order message ready to confirm.",
    deliveryCairoGiza: "Cairo & Giza — 99 EGP", deliveryAlex: "Alexandria — 120 EGP", deliveryDeltaCanal: "Delta & Canal — 125 EGP", deliveryAssiut: "Assiut — 200 EGP", deliveryNorthCoast: "North Coast — 220 EGP", checkoutTotalLabel: "Total including delivery", premiumFreeDeliveryCheckout: "Free delivery with Modo Premium Wallet",
    footerAbout: "Anti-loss 100% natural leather wallets with a safer premium feel.", footerContact: "Contact", footerSocial: "Follow us", copyright: "© 2026 Modo Smart Wallets. All rights reserved.", stickyCTA: "Order now",
    pageTopStrip: "Anti-loss / Safe / 100% Natural Leather",
    storyPageKicker: "MODO Story", storyPageHeroTitle: "It started from a real problem", storyPageHeroText: "A lost wallet showed the need for something premium that also protects you from daily worry. MODO is 100% natural leather, anti-loss protection, and safer ordering in Egypt.",
    storyFullEyebrow: "Our Story",
    storyFullTitle: "It did not start as a business... it started from a real problem.",
    storyFullP1: "I am Youssef Rashwan. One day, I lost my wallet with everything inside: cards, money, and important items.",
    storyFullP2: "That moment made me realize how much we depend on something as simple as a wallet, yet it has no real protection.",
    storyFullP3: "That is where the idea started: why not create a wallet that looks premium and helps you feel secure?",
    storyFullFeature1: "Premium design that fits your style",
    storyFullFeature2: "High-quality natural leather",
    storyFullFeature3: "Smart technology to help you find it if lost",
    storyFullHighlight: "Modo is more than a wallet: daily protection, premium design, and long-lasting quality.",
    storyFullNote: "We are not a faceless big company. We are real people in Egypt, building a product that lives with you.",
    storyCard1Title: "100% Natural Leather", storyCard1Text: "The material is part of the identity, not just a product detail.", storyCard2Title: "Anti-loss Protection", storyCard2Text: "Tracking, out-of-range alert, and alarm sound to help you find it.", storyCard3Title: "Safer Ordering", storyCard3Text: "Cash on Delivery and WhatsApp confirmation before shipping.",
    whyPageKicker: "Why MODO", whyPageHeroTitle: "Safer ordering, premium daily carry", whyPageHeroText: "MODO is not one feature. It is the mix of 100% natural leather, anti-loss protection, and Cash on Delivery.",
    whyCard1Title: "Cash on Delivery", whyCard1Text: "Pay when you receive your order, with WhatsApp confirmation before shipping.", whyCard2Title: "Alert and alarm sound", whyCard2Text: "The wallet helps you notice distance and find it when it is nearby.", whyCard3Title: "100% Natural Leather", whyCard3Text: "A quiet premium finish for daily use and gifting.",
    howPageKicker: "How it works", howPageHeroTitle: "Simple setup, daily protection", howPageHeroText: "The wallet connects to your phone so you can receive alerts or make it ring when you need it.",
    howCard1Title: "Download the app", howCard1Text: "Use the iSearching app on iOS or Android.", howCard2Title: "Connect the wallet", howCard2Text: "Long press the M button, then press Connect in the iSearching app.", howCard3Title: "Receive alerts", howCard3Text: "Get out-of-range alerts and use alarm sound to find it.",
    faqPageKicker: "FAQ", faqPageHeroTitle: "Questions before ordering", faqPageHeroText: "Short answers to the important things before you choose MODO.",
    faqCard1Title: "Is it real leather?", faqCard1Text: "Yes. MODO wallets are made from 100% natural leather with a premium finish.", faqCard2Title: "Is it an AirTag alternative?", faqCard2Text: "It is not an Apple AirTag, but it gives you a practical phone-based tracking and alert experience.", faqCard3Title: "Is Cash on Delivery available?", faqCard3Text: "Yes. Cash on Delivery is available in Egypt with WhatsApp confirmation before shipping."
  }
};

Object.assign(translations.ar, {
  heroKicker: "MODO Smart Wallet",
  heroTitle: "محفظتك مش هتضيع تاني",
  heroSubtitle: "محفظة جلد طبيعي بتتبع ذكي، تنبيه عند الابتعاد، وصوت إنذار يساعدك تلاقيها بسهولة.",
  heroCTA: "اطلب الآن",
  heroExplore: "شوف المنتجات",
  heroVideoLabel: "تتبع ذكي ضد الفقد",
  heroVideoText: "جلد طبيعي. تنبيه. صوت إنذار.",
  trustCodTitle: "الدفع عند الاستلام",
  trustCodText: "ادفع لما تستلم المنتج.",
  trustFastTitle: "شحن سريع داخل مصر",
  trustFastText: "توصيل حسب المنطقة.",
  trustWarrantyTitle: "استبدال 7 أيام",
  trustWarrantyText: "في حالة عيب تصنيع.",
  whyHomeEyebrow: "ليه MODO؟",
  whyHomeTitle: "تفاصيل صغيرة بتفرق كل يوم",
  whyHomeSubtitle: "خامة فاخرة وتجربة ذكية تخليك مطمن على محفظتك في الاستخدام اليومي.",
  whyAntiLossTitle: "ضد الضياع",
  whyAntiLossText: "تتبع بالموبايل يساعدك تعرف آخر مكان قريب للمحفظة.",
  whyLeatherTitle: "جلد طبيعي فاخر",
  whyLeatherText: "ملمس وشكل مناسبين للشغل، الخروج، والهدايا.",
  whyAlertTitle: "تنبيه عند الابتعاد",
  whyAlertText: "الموبايل ينبهك لما المحفظة تبعد عنك.",
  whyAlarmTitle: "صوت إنذار",
  whyAlarmText: "خلّي المحفظة ترن عشان تلاقيها بسهولة.",
  trackingEyebrow: "طريقة التتبع",
  trackingTitle: "تشتغل في 3 خطوات بسيطة",
  trackingSubtitle: "تجربة خفيفة وسريعة، معمولة عشان الاستخدام اليومي مش التعقيد.",
  trackingStep1Title: "حمّل التطبيق",
  trackingStep1Text: "استخدم تطبيق iSearching على الموبايل.",
  trackingStep2Title: "وصّل بالبلوتوث",
  trackingStep2Text: "اربط المحفظة بالموبايل خلال لحظات.",
  trackingStep3Title: "استقبل التنبيهات",
  trackingStep3Text: "استقبل تنبيه أو شغّل صوت الإنذار عند الحاجة.",
  comparisonEyebrow: "المقارنة",
  comparisonTitle: "ليه MODO أفضل من المحفظة العادية؟",
  regularWalletTitle: "محفظة عادية",
  regularPoint1: "لا يوجد تتبع",
  regularPoint2: "لا يوجد تنبيه",
  regularPoint3: "يصعب العثور عليها عند الفقد",
  modoWalletTitle: "MODO Smart Wallet",
  modoPoint1: "تتبع بالموبايل",
  modoPoint2: "تنبيه عند الابتعاد",
  modoPoint3: "صوت إنذار",
  modoPoint4: "جلد طبيعي",
  deliveryEyebrow: "قبل الطلب",
  deliveryTitle: "طلب واضح قبل الشحن",
  deliverySubtitle: "كل طلب يتم تأكيده على واتساب قبل الشحن، مع دفع عند الاستلام وسياسة استبدال واضحة.",
  deliveryCard1Title: "الدفع عند الاستلام متاح",
  deliveryCard1Text: "ادفع لما تستلم المنتج.",
  deliveryCard2Title: "التوصيل خلال 2–4 أيام",
  deliveryCard2Text: "حسب المنطقة وشركة الشحن.",
  deliveryCard3Title: "استبدال خلال 7 أيام",
  deliveryCard3Text: "في حالة وجود عيب تصنيع.",
  deliveryCard4Title: "تأكيد واتساب قبل الشحن",
  deliveryCard4Text: "نراجع الاسم، العنوان، والمنطقة.",
  productsTitle: "اختار محفظتك",
  productsSubtitle: "موديلات قصيرة وواضحة: حماية ذكية، جلد طبيعي 100%، وتجربة طلب سهلة.",
  orderSubtitle: "هنفتح واتساب فورًا لتأكيد الطلب قبل الشحن.",
  orderUrgency: "العرض الحالي محدود. احجز السعر قبل انتهاء أول 25 قطعة.",
  stickyCTA: "اطلب الآن"
});

Object.assign(translations.en, {
  heroKicker: "MODO Smart Wallet",
  heroTitle: "Never lose your wallet again.",
  heroSubtitle: "A premium leather smart wallet with tracking, alerts, and everyday security.",
  heroCTA: "Order now",
  heroExplore: "View products",
  heroVideoLabel: "Smart anti-loss tracking",
  heroVideoText: "Leather. Alert. Alarm sound.",
  trustCodTitle: "Cash on Delivery",
  trustCodText: "Pay when you receive it.",
  trustFastTitle: "Fast delivery in Egypt",
  trustFastText: "Delivery depends on area.",
  trustWarrantyTitle: "7-day replacement",
  trustWarrantyText: "For manufacturing defects.",
  whyHomeEyebrow: "Why MODO?",
  whyHomeTitle: "Small details that matter every day",
  whyHomeSubtitle: "Premium material and smart protection for calmer everyday carry.",
  whyAntiLossTitle: "Anti-loss",
  whyAntiLossText: "Phone tracking helps you locate the wallet nearby.",
  whyLeatherTitle: "Premium natural leather",
  whyLeatherText: "A refined feel for work, daily carry, and gifting.",
  whyAlertTitle: "Out-of-range alert",
  whyAlertText: "Your phone alerts you when the wallet moves away.",
  whyAlarmTitle: "Alarm sound finder",
  whyAlarmText: "Make the wallet ring so you can find it quickly.",
  trackingEyebrow: "How tracking works",
  trackingTitle: "Works in 3 simple steps",
  trackingSubtitle: "A light setup made for daily use, not complexity.",
  trackingStep1Title: "Download the app",
  trackingStep1Text: "Use the iSearching app on your phone.",
  trackingStep2Title: "Connect Bluetooth",
  trackingStep2Text: "Pair the wallet with your phone in moments.",
  trackingStep3Title: "Get alerts",
  trackingStep3Text: "Receive alerts or trigger the alarm sound when needed.",
  comparisonEyebrow: "Comparison",
  comparisonTitle: "Why is MODO better than a regular wallet?",
  regularWalletTitle: "Regular wallet",
  regularPoint1: "No tracking",
  regularPoint2: "No alert",
  regularPoint3: "Hard to find when lost",
  modoWalletTitle: "MODO Smart Wallet",
  modoPoint1: "Phone tracking",
  modoPoint2: "Out-of-range alert",
  modoPoint3: "Alarm sound",
  modoPoint4: "Natural leather",
  deliveryEyebrow: "Before checkout",
  deliveryTitle: "Clear ordering before shipping",
  deliverySubtitle: "Every order is confirmed on WhatsApp before shipping, with Cash on Delivery and a clear replacement policy.",
  deliveryCard1Title: "Cash on Delivery available",
  deliveryCard1Text: "Pay when you receive your order.",
  deliveryCard2Title: "Delivery within 2–4 days",
  deliveryCard2Text: "Depending on area and courier.",
  deliveryCard3Title: "7-day replacement",
  deliveryCard3Text: "For manufacturing defects.",
  deliveryCard4Title: "WhatsApp confirmation",
  deliveryCard4Text: "We confirm name, address, and area.",
  productsTitle: "Choose your wallet",
  productsSubtitle: "Clear models: smart protection, 100% natural leather, and easy ordering.",
  orderSubtitle: "WhatsApp opens immediately to confirm your order before shipping.",
  orderUrgency: "The current offer is limited. Reserve the price before the first 25 pieces end.",
  stickyCTA: "Order now"
});

Object.assign(translations.ar, {
  trackingStep2Title: "وصل المحفظة",
  trackingStep2Text: "ضغطة مطولة على حرف M، وبعدها اضغط Connect داخل تطبيق iSearching."
});

Object.assign(translations.en, {
  trackingStep2Title: "Connect the wallet",
  trackingStep2Text: "Long press the M button, then press Connect in the iSearching app."
});

Object.assign(translations.ar, {
  chooseProduct: "تفاصيل وشراء",
  addToCart: "أضف للسلة",
  addedToCart: "اتضافت للسلة",
  cartAddedToast: "اتضافت للسلة",
  cartAddedOpen: "شوف السلة",
  buyNow: "اشتري الآن",
  viewCart: "السلة",
  navCart: "السلة",
  cartTitle: "سلة MODO",
  cartSubtitle: "راجع الموديلات اللي اخترتها، وبعدها كمل بياناتك على صفحة الدفع.",
  cartEmptyTitle: "السلة فاضية",
  cartEmptyText: "اختار موديل من المحافظ واضيفه للسلة.",
  cartContinue: "اختار موديل",
  cartCheckout: "كمل الطلب",
  cartClear: "تفريغ السلة",
  cartItemCount: "عدد القطع",
  productPageEyebrow: "MODO Collection",
  productPageIncluded: "المميزات الأساسية",
  productPageWhy: "ليه هيناسبك؟",
  productPageDelivery: "توصيل ودفع آمن",
  productPageDeliveryText: "الدفع عند الاستلام متاح، والتأكيد بيتم على واتساب قبل الشحن.",
  productPageChooseAnother: "شوف موديل تاني",
  smartPageWhy: "اختيار مناسب لو عايز راحة بال يومية: تتبع بالموبايل، تنبيه عند الابتعاد، وصوت إنذار يساعدك تلاقي المحفظة بسرعة.",
  classicPageWhy: "اختيار مناسب لو عايز محفظة جلد طبيعي 100% بشكل كلاسيكي نظيف بدون تتبع.",
  premiumPageWhy: "اختيار مناسب لو عايز إحساس أفخم، شكل يصلح كهدية، تتبع ذكي، وتوصيل مجاني.",
  cartModeLabel: "طلب من السلة",
  cartModeProducts: "المنتجات المختارة",
  cartSubtotalLabel: "إجمالي المنتجات",
  cartShippingNote: "الشحن بيتحسب حسب منطقة التوصيل."
});

Object.assign(translations.en, {
  chooseProduct: "Details & buy",
  addToCart: "Add to cart",
  addedToCart: "Added to cart",
  cartAddedToast: "Added to cart",
  cartAddedOpen: "View cart",
  buyNow: "Buy now",
  viewCart: "Cart",
  navCart: "Cart",
  cartTitle: "MODO Cart",
  cartSubtitle: "Review your selected models, then continue to checkout.",
  cartEmptyTitle: "Your cart is empty",
  cartEmptyText: "Choose a wallet model and add it to cart.",
  cartContinue: "Choose a model",
  cartCheckout: "Complete order",
  cartClear: "Clear cart",
  cartItemCount: "Quantity",
  productPageEyebrow: "MODO Collection",
  productPageIncluded: "Key features",
  productPageWhy: "Why it fits",
  productPageDelivery: "Delivery and safe payment",
  productPageDeliveryText: "Cash on Delivery is available, and your order is confirmed on WhatsApp before shipping.",
  productPageChooseAnother: "View another model",
  smartPageWhy: "Best for daily peace of mind: phone tracking, out-of-range alerts, and alarm sound to find the wallet fast.",
  classicPageWhy: "Best if you want a clean 100% natural leather wallet without tracker.",
  premiumPageWhy: "Best if you want a more luxurious finish, gift-worthy feel, smart tracking, and free delivery.",
  cartModeLabel: "Cart order",
  cartModeProducts: "Selected products",
  cartSubtotalLabel: "Products subtotal",
  cartShippingNote: "Shipping is calculated by delivery area."
});

const defaultReviews = [
  { name: "أحمد", city: "القاهرة", rating: 5, text: "الخامة شيك جداً والمحفظة حجمها مناسب. وصلت بسرعة والدفع كان عند الاستلام.", imageUrl: `${IMG_BASE}smart-wallet.jpg`, createdAtText: "اليوم" },
  { name: "عمر", city: "الجيزة", rating: 5, text: "ميزة التنبيه ممتازة. شكلها فخم ومش تقني زيادة.", createdAtText: "أمس" },
  { name: "كريم", city: "الإسكندرية", rating: 5, text: "اشتريتها هدية وكانت ممتازة. التغليف والجلد شكلهم راقي.", imageUrl: `${IMG_BASE}premium-wallet.jpg`, createdAtText: "هذا الأسبوع" },
  { name: "يوسف", city: "القاهرة", rating: 5, text: "حبيت إن شكلها جلد طبيعي فعلاً ومش باين عليها إنها تقنية. فكرة الصوت مفيدة جداً.", imageUrl: `${IMG_BASE}classic-wallet.jpg`, createdAtText: "هذا الشهر" }
];

function t(key) { return translations[currentLang]?.[key] || key; }
function money(value) { return `${Number(value).toLocaleString()} EGP`; }
function getProduct(id) { return products.find(product => product.id === id) || products[0]; }
function productPagePath(id) { return PRODUCT_PAGE_PATHS[id] || PRODUCT_PAGE_PATHS.smart; }
function getProductPageWhy(id) {
  const key = `${id}PageWhy`;
  return t(key) === key ? getProduct(id)[currentLang].desc : t(key);
}
function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem("modoCart") || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(item => products.some(product => product.id === item.id) && Number(item.qty) > 0)
      : [];
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem("modoCart", JSON.stringify(cart));
  updateCartCount();
}
function getCartCount() {
  return getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
}
function addToCart(id, qty = 1) {
  const product = getProduct(id);
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty = Math.min(9, Number(existing.qty || 1) + qty);
  else cart.push({ id: product.id, qty });
  saveCart(cart);
  showCartAddedFeedback(product);
  return cart;
}
function setCartQty(id, qty) {
  const nextQty = Math.max(0, Math.min(9, Number(qty) || 0));
  const cart = getCart()
    .map(item => item.id === id ? { ...item, qty: nextQty } : item)
    .filter(item => item.qty > 0);
  saveCart(cart);
  renderCartPage();
}
function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
  renderCartPage();
}
function clearCart() {
  saveCart([]);
  renderCartPage();
}
function getCartItems() {
  return getCart().map(item => ({ product: getProduct(item.id), qty: Number(item.qty || 1) }));
}
function getCheckoutItems() {
  const cartItems = checkoutCartMode ? getCartItems() : [];
  if (cartItems.length) return cartItems;
  checkoutCartMode = false;
  return [{ product: getProduct(selectedProductId), qty: 1 }];
}
function getCheckoutSubtotal() {
  return getCheckoutItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
}
function checkoutIsPremiumOnly() {
  const items = getCheckoutItems();
  return items.length > 0 && items.every(item => item.product.id === "premium");
}
function getDeliveryRegion() {
  const select = document.getElementById("deliveryRegion");
  const key = select && DELIVERY_REGIONS[select.value] ? select.value : selectedDeliveryRegion;
  return { key, ...DELIVERY_REGIONS[key] };
}
function getEffectiveDeliveryFee() { return checkoutIsPremiumOnly() ? 0 : getDeliveryRegion().fee; }
function getEffectiveDeliveryText() { return checkoutIsPremiumOnly() ? (currentLang === "ar" ? "مجاني" : "Free") : money(getDeliveryRegion().fee); }
function normalizeEgyptPhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `2${digits}`;
  return digits;
}
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text || "");
  return div.innerHTML;
}

function reviewIsConfigured(value) {
  return value && !String(value).includes("PUT_YOUR");
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadReviewImage(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > 3 * 1024 * 1024) throw new Error("Image must be less than 3 MB.");

  const cloudReady = reviewIsConfigured(CLOUDINARY_CLOUD_NAME) && reviewIsConfigured(CLOUDINARY_UPLOAD_PRESET);
  if (!cloudReady) return readImageAsDataUrl(file);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "modo-reviews");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Image upload failed.");
    const data = await response.json();
    return data.secure_url || "";
  } catch (error) {
    console.warn("Cloudinary upload failed, storing the image locally.", error);
    return readImageAsDataUrl(file);
  }
}

async function sendOrderEmailViaEmailJS(orderData) {
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: orderData
      })
    });
    if (!response.ok) throw new Error(`EmailJS error ${response.status}: ${await response.text()}`);
    return true;
  } catch (error) {
    console.error("EmailJS order email failed:", error);
    return false;
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("en", currentLang === "en");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.textContent = currentLang === "ar" ? "English" : "العربية";
  const placeholders = {
    customerName: currentLang === "ar" ? "اكتب اسمك بالكامل" : "Write your full name",
    customerPhone: "01XXXXXXXXX",
    customerAddress: currentLang === "ar" ? "المحافظة، المنطقة، الشارع، رقم العمارة" : "Governorate, area, street, building number",
    customerNotes: currentLang === "ar" ? "أي ملاحظات للتوصيل؟" : "Any delivery notes?",
    reviewName: currentLang === "ar" ? "مثال: أحمد" : "Example: Ahmed",
    reviewCity: currentLang === "ar" ? "مثال: القاهرة" : "Example: Cairo",
    reviewText: currentLang === "ar" ? "اكتب تقييمك هنا..." : "Write your review here..."
  };
  Object.entries(placeholders).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
  });
  renderProducts();
  renderProductPage();
  renderCartPage();
  renderProductOptions();
  updateSelectedProduct();
  setupPaymentMethodList();
  updateCartCount();
  renderLiveReviews(getLocalReviews());
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = products.map(product => {
    const d = product[currentLang];
    const premiumMore = product.id === "premium" ? `
      <details class="premium-more">
        <summary>${t("readMoreProduct")}</summary>
        <div class="premium-more-body">
          <strong>${d.moreTitle}</strong>
          <p>${d.moreText}</p>
          <ul>${d.moreFeatures.map(feature => `<li>${feature}</li>`).join("")}</ul>
        </div>
      </details>
    ` : "";
    return `
      <article class="product-card reveal ${product.featured ? "featured" : ""}">
        <span class="product-tag">${d.tag}</span>
        ${product.id === "premium" ? `<span class="free-delivery-badge">${t("premiumFreeDelivery")}</span>` : ""}
        <img src="${product.image}" alt="${d.name}" loading="lazy" decoding="async">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        ${d.trackerNote ? `<div class="product-tracker-note">${d.trackerNote}</div>` : ""}
        <ul class="product-features">${d.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
        ${premiumMore}
        <div class="price-row"><span class="new-price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div>
        <div class="product-actions">
          <a class="btn btn-primary choose-btn" href="${productPagePath(product.id)}">${t("chooseProduct")}</a>
          <button class="btn btn-secondary product-cart-btn" type="button" data-add-product-id="${product.id}">${t("addToCart")}</button>
        </div>
      </article>
    `;
  }).join("");
  grid.querySelectorAll("[data-add-product-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.addProductId);
      btn.textContent = t("addedToCart");
      btn.classList.add("is-added");
      setTimeout(() => {
        btn.textContent = t("addToCart");
        btn.classList.remove("is-added");
      }, 1200);
    });
  });
  setupReveal();
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll(".cart-link").forEach(link => {
    link.classList.toggle("has-items", count > 0);
    link.setAttribute("aria-label", t("viewCart"));
  });
  renderCartFloatContent();
}

function pulseCartLink() {
  document.querySelectorAll(".cart-link").forEach(link => {
    link.classList.remove("cart-pulse");
    void link.offsetWidth;
    link.classList.add("cart-pulse");
    window.setTimeout(() => link.classList.remove("cart-pulse"), 720);
  });
}

function showCartAddedFeedback(product) {
  pulseCartLink();
  renderCartFloatContent(product);
}

function renderCartFloatContent(focusProduct = null) {
  const count = getCartCount();
  const items = getCartItems();
  const fallbackItem = items[items.length - 1];
  const product = focusProduct || fallbackItem?.product;
  document.querySelectorAll(".cart-float").forEach(link => {
    if (!count || !product) {
      link.innerHTML = "";
      link.classList.remove("has-items");
      return;
    }
    const productName = product[currentLang].name;
    link.classList.add("has-items");
    link.innerHTML = `
      <span class="cart-float-cta">${t("cartAddedOpen")}</span>
      <span class="cart-float-copy">
        <strong>${t("cartAddedToast")}</strong>
        <em>${escapeHtml(productName)}</em>
      </span>
      <img src="${product.image}" alt="${escapeHtml(productName)}">
      <b data-cart-count>${count}</b>
    `;
  });
}

function setupCartNav() {
  const currentPage = location.pathname.split("/").pop();
  if (currentPage === "cart.html" || currentPage === "checkout.html") return;
  if (document.querySelector(".cart-link")) return;
  const link = document.createElement("a");
  link.className = "cart-link cart-float";
  link.href = "./cart.html";
  link.setAttribute("aria-label", t("viewCart"));
  link.setAttribute("aria-live", "polite");
  document.body.appendChild(link);
  updateCartCount();
}

function setupCartActions(scope = document) {
  scope.querySelectorAll("[data-add-product-id]").forEach(btn => {
    if (btn.dataset.cartReady) return;
    btn.dataset.cartReady = "true";
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.addProductId);
      btn.textContent = t("addedToCart");
      btn.classList.add("is-added");
      setTimeout(() => {
        btn.textContent = btn.dataset.defaultText || t("addToCart");
        btn.classList.remove("is-added");
      }, 1200);
    });
  });
}

function renderProductPage() {
  const page = document.getElementById("productPage");
  if (!page) return;
  const id = document.body.dataset.productPage || "smart";
  const product = getProduct(id);
  selectedProductId = product.id;
  const d = product[currentLang];
  document.title = `${d.name} | MODO Smart Wallet`;
  page.innerHTML = `
    <section class="section product-detail-hero">
      <div class="container product-detail-grid">
        <div class="product-detail-media reveal">
          ${product.id === "premium" ? `<span class="free-delivery-badge product-page-badge">${t("premiumFreeDelivery")}</span>` : ""}
          <img src="${product.image}" alt="${d.name}" loading="eager" decoding="async">
        </div>
        <div class="product-detail-copy reveal">
          <span class="product-detail-eyebrow">${t("productPageEyebrow")}</span>
          <h1>${d.name}</h1>
          <p>${d.desc}</p>
          ${d.trackerNote ? `<div class="product-tracker-note">${d.trackerNote}</div>` : ""}
          <div class="price-row product-detail-price"><span class="new-price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div>
          <div class="product-detail-actions">
            <a class="btn btn-primary" href="./checkout.html?product=${product.id}">${t("buyNow")}</a>
            <button class="btn btn-secondary" type="button" data-add-product-id="${product.id}" data-default-text="${t("addToCart")}">${t("addToCart")}</button>
            <a class="btn btn-secondary cart-soft-link" href="./cart.html">${t("viewCart")}</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section product-detail-info">
      <div class="container product-info-grid">
        <article class="product-info-card reveal">
          <span>01</span>
          <h2>${t("productPageIncluded")}</h2>
          <ul>${d.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
        </article>
        <article class="product-info-card reveal">
          <span>02</span>
          <h2>${t("productPageWhy")}</h2>
          <p>${getProductPageWhy(product.id)}</p>
        </article>
        <article class="product-info-card reveal">
          <span>03</span>
          <h2>${t("productPageDelivery")}</h2>
          <p>${t("productPageDeliveryText")}</p>
          <a class="text-link" href="./index.html#products">${t("productPageChooseAnother")}</a>
        </article>
      </div>
    </section>
  `;
  setupCartActions(page);
  setupReveal();
}

function renderCartPage() {
  const page = document.getElementById("cartPage");
  if (!page) return;
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  if (!items.length) {
    page.innerHTML = `
      <section class="section cart-page-section">
        <div class="container cart-empty">
          <span>${t("navCart")}</span>
          <h1>${t("cartEmptyTitle")}</h1>
          <p>${t("cartEmptyText")}</p>
          <a class="btn btn-primary" href="./index.html#products">${t("cartContinue")}</a>
        </div>
      </section>
    `;
    return;
  }
  page.innerHTML = `
    <section class="section cart-page-section">
      <div class="container cart-layout">
        <div class="cart-list-panel reveal">
          <span>${t("navCart")}</span>
          <h1>${t("cartTitle")}</h1>
          <p>${t("cartSubtitle")}</p>
          <div class="cart-items">
            ${items.map(({ product, qty }) => `
              <article class="cart-item">
                <img src="${product.image}" alt="${product[currentLang].name}" loading="lazy" decoding="async">
                <div>
                  <h2>${product[currentLang].name}</h2>
                  <p>${product[currentLang].desc}</p>
                  <div class="cart-item-controls">
                    <button type="button" data-cart-dec="${product.id}" aria-label="Decrease">-</button>
                    <strong>${qty}</strong>
                    <button type="button" data-cart-inc="${product.id}" aria-label="Increase">+</button>
                    <button type="button" data-cart-remove="${product.id}">${currentLang === "ar" ? "حذف" : "Remove"}</button>
                  </div>
                </div>
                <strong>${money(product.price * qty)}</strong>
              </article>
            `).join("")}
          </div>
        </div>
        <aside class="cart-summary-panel reveal">
          <span>${t("cartSubtotalLabel")}</span>
          <strong>${money(subtotal)}</strong>
          <p>${t("cartShippingNote")}</p>
          <a class="btn btn-primary" href="./checkout.html?cart=1">${t("cartCheckout")}</a>
          <button class="btn btn-secondary" type="button" id="clearCartBtn">${t("cartClear")}</button>
        </aside>
      </div>
    </section>
  `;
  page.querySelectorAll("[data-cart-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = getCart().find(cartItem => cartItem.id === btn.dataset.cartInc);
      setCartQty(btn.dataset.cartInc, Number(item?.qty || 1) + 1);
    });
  });
  page.querySelectorAll("[data-cart-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = getCart().find(cartItem => cartItem.id === btn.dataset.cartDec);
      setCartQty(btn.dataset.cartDec, Number(item?.qty || 1) - 1);
    });
  });
  page.querySelectorAll("[data-cart-remove]").forEach(btn => btn.addEventListener("click", () => removeFromCart(btn.dataset.cartRemove)));
  page.querySelector("#clearCartBtn")?.addEventListener("click", clearCart);
  setupReveal();
}

function renderProductOptions() {
  const select = document.getElementById("productSelect");
  if (!select) return;
  const label = document.querySelector('label[for="productSelect"]');
  if (checkoutCartMode && getCartItems().length) {
    select.hidden = true;
    if (label) label.hidden = true;
    updateCheckoutTotal();
    return;
  }
  select.hidden = false;
  if (label) label.hidden = false;
  select.innerHTML = products.map(product => `<option value="${product.id}">${product[currentLang].name} — ${money(product.price)}</option>`).join("");
  select.value = selectedProductId;
  updateCheckoutTotal();
}

function chooseProduct(id) {
  selectedProductId = id;
  if (!isCheckoutPage()) {
    window.location.href = productPagePath(id);
    return;
  }
  checkoutCartMode = false;
  renderProductOptions();
  updateSelectedProduct();
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCheckoutCartSummary() {
  const card = document.getElementById("selectedProductCard");
  if (!card) return;
  const items = getCartItems();
  if (!items.length) return;
  card.classList.add("cart-selected-card");
  card.innerHTML = `
    <div class="cart-selected-head">
      <small>${t("cartModeLabel")}</small>
      <h3>${t("cartModeProducts")}</h3>
    </div>
    <div class="cart-selected-list">
      ${items.map(({ product, qty }) => `
        <div class="cart-selected-item">
          <img src="${product.image}" alt="${product[currentLang].name}" loading="lazy" decoding="async">
          <div>
            <strong>${product[currentLang].name}</strong>
            <span>${qty} × ${money(product.price)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function updateSelectedProduct() {
  if (checkoutCartMode && getCartItems().length) {
    renderCheckoutCartSummary();
    updateCheckoutTotal();
    return;
  }
  const product = products.find(item => item.id === selectedProductId);
  if (!product) return;
  const img = document.getElementById("selectedProductImg");
  const name = document.getElementById("selectedProductName");
  const oldPrice = document.getElementById("selectedOldPrice");
  const price = document.getElementById("selectedPrice");
  if (img) img.src = product.image;
  if (name) name.textContent = product[currentLang].name;
  if (oldPrice) oldPrice.textContent = money(product.oldPrice);
  if (price) price.textContent = money(product.price);
  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const product = getProduct(selectedProductId);
  const subtotal = getCheckoutSubtotal();
  const deliveryFee = getEffectiveDeliveryFee();
  const totalBox = document.getElementById("checkoutTotalBox");
  const totalValue = document.getElementById("checkoutTotalValue");
  const subtotalValue = document.getElementById("checkoutSubtotalValue");
  const shippingValue = document.getElementById("checkoutShippingValue");
  const premiumNote = document.getElementById("premiumFreeDeliveryNote");
  const labels = currentLang === "ar"
    ? { subtotal: "سعر المنتج", shipping: "التوصيل", total: "الإجمالي" }
    : { subtotal: "Subtotal", shipping: "Shipping", total: "Total" };

  if (totalBox && !totalBox.dataset.breakdownReady) {
    totalBox.innerHTML = `
      <div class="checkout-total-row">
        <span id="checkoutSubtotalLabel"></span>
        <strong id="checkoutSubtotalValue"></strong>
      </div>
      <div class="checkout-total-row">
        <span id="checkoutShippingLabel"></span>
        <strong id="checkoutShippingValue"></strong>
      </div>
      <div class="checkout-total-row checkout-total-final">
        <span id="checkoutTotalLabelText"></span>
        <strong><small>EGP</small> <b id="checkoutTotalValue"></b></strong>
      </div>
    `;
    totalBox.dataset.breakdownReady = "true";
  }

  document.getElementById("checkoutSubtotalLabel") && (document.getElementById("checkoutSubtotalLabel").textContent = labels.subtotal);
  document.getElementById("checkoutShippingLabel") && (document.getElementById("checkoutShippingLabel").textContent = labels.shipping);
  document.getElementById("checkoutTotalLabelText") && (document.getElementById("checkoutTotalLabelText").textContent = labels.total);

  const refreshedTotalValue = document.getElementById("checkoutTotalValue");
  const refreshedSubtotalValue = document.getElementById("checkoutSubtotalValue");
  const refreshedShippingValue = document.getElementById("checkoutShippingValue");

  if (product && refreshedSubtotalValue) refreshedSubtotalValue.textContent = money(subtotal);
  if (product && refreshedShippingValue) refreshedShippingValue.textContent = getEffectiveDeliveryText();
  if (product && refreshedTotalValue) refreshedTotalValue.textContent = money(subtotal + deliveryFee).replace(" EGP", "");
  if (premiumNote) premiumNote.hidden = !checkoutIsPremiumOnly();
}

function setupPaymentMethodList() {
  const select = document.getElementById("paymentMethod");
  if (!select) return;

  select.classList.add("payment-select-hidden");
  let list = document.getElementById("paymentMethodList");
  if (!list) {
    list = document.createElement("div");
    list.id = "paymentMethodList";
    list.className = "payment-method-list";
    select.insertAdjacentElement("afterend", list);
  }

  const getPaymentMeta = value => {
    const key = String(value || "").toLowerCase();
    if (key.includes("instapay")) return { className: "instapay", label: "IP" };
    if (key.includes("vodafone")) return { className: "vodafone", label: "V" };
    return { className: "cod", label: "🚚" };
  };

  list.innerHTML = Array.from(select.options).map((option, index) => {
    const meta = getPaymentMeta(option.value);
    return `
    <label class="payment-method-option">
      <input type="radio" name="paymentMethodChoice" value="${escapeHtml(option.value)}" ${select.value === option.value || (!select.value && index === 0) ? "checked" : ""}>
      <span class="payment-method-copy">${escapeHtml(option.textContent)}</span>
      <span class="payment-method-logo payment-method-logo-${meta.className}" aria-hidden="true">${meta.label}</span>
    </label>
  `;
  }).join("");

  list.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      select.value = input.value;
    });
  });
}

function setupGallery() {
  const main = document.getElementById("mainGalleryImage");
  if (!main) return;
  document.querySelectorAll(".thumb").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".thumb").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      main.src = button.dataset.img;
    });
  });
}

function setupMenu() {
  const btn = document.getElementById("menuBtn");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(link => link.addEventListener("click", () => links.classList.remove("open")));
}

function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  const reveal = () => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 70) el.classList.add("active");
  });
  reveal();
  window.addEventListener("scroll", reveal, { passive: true });
}

function getLocalReviews() {
  const saved = JSON.parse(localStorage.getItem("modoLocalReviews") || "[]");
  return [...saved, ...defaultReviews];
}

function renderLiveReviews(reviews) {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;
  latestReviewsData = reviews.filter(review => String(review.text || "").trim().length > 3)
    .sort((a, b) => String(b.text || "").length - String(a.text || "").length)
    .slice(0, 30);
  grid.innerHTML = latestReviewsData.map(review => `
    <article class="review-card reveal">
      ${review.imageUrl ? `<img src="${escapeHtml(review.imageUrl)}" alt="Customer review photo" loading="lazy">` : ""}
      <div class="stars">${"★".repeat(Number(review.rating) || 5)}</div>
      <p>${escapeHtml(review.text)}</p>
      <strong>${escapeHtml(review.name)}${review.city ? ` — ${escapeHtml(review.city)}` : ""}</strong>
      <div class="review-meta">${escapeHtml(review.createdAtText || "Live")}</div>
    </article>
  `).join("");
  updateReviewsToggle();
  setupReveal();
}

function updateReviewsToggle() {
  const btn = document.getElementById("reviewsToggleBtn");
  const grid = document.getElementById("reviewsGrid");
  if (!btn || !grid) return;
  const hasMore = latestReviewsData.length > 1;
  btn.style.display = hasMore ? "inline-flex" : "none";
  btn.textContent = reviewsExpanded ? t("showLessReviews") : t("viewAllReviews");
  grid.classList.toggle("compact-one", !reviewsExpanded && hasMore);
}

async function initLiveReviews() {
  const badge = document.querySelector(".reviews-toolbar span");
  const firebaseReady =
    reviewIsConfigured(firebaseConfigLiveReviews.apiKey) &&
    reviewIsConfigured(firebaseConfigLiveReviews.authDomain) &&
    reviewIsConfigured(firebaseConfigLiveReviews.projectId) &&
    reviewIsConfigured(firebaseConfigLiveReviews.appId);

  if (!firebaseReady) {
    if (badge) badge.textContent = currentLang === "ar" ? "محلي" : "Local";
    renderLiveReviews(getLocalReviews());
    return;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const firestore = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const app = initializeApp(firebaseConfigLiveReviews);
    liveReviewsDb = firestore.getFirestore(app);
    liveReviewsEnabled = true;
    window.modoFirestore = firestore;
    if (badge) badge.textContent = "Live";

    const reviewsQuery = firestore.query(
      firestore.collection(liveReviewsDb, "modoReviews"),
      firestore.orderBy("createdAt", "desc"),
      firestore.limit(30)
    );

    firestore.onSnapshot(reviewsQuery, snapshot => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderLiveReviews(reviews.length ? reviews : getLocalReviews());
    }, error => {
      console.error("Firebase review listener error:", error);
      liveReviewsEnabled = false;
      if (badge) badge.textContent = currentLang === "ar" ? "محلي" : "Local";
      renderLiveReviews(getLocalReviews());
    });
  } catch (error) {
    console.error("Firebase init error:", error);
    liveReviewsEnabled = false;
    if (badge) badge.textContent = currentLang === "ar" ? "محلي" : "Local";
    renderLiveReviews(getLocalReviews());
  }
}

function setupReviews() {
  const toggle = document.getElementById("reviewsToggleBtn");
  const writeToggle = document.getElementById("writeReviewToggle");
  const form = document.getElementById("reviewForm");
  if (toggle) toggle.addEventListener("click", () => {
    reviewsExpanded = !reviewsExpanded;
    updateReviewsToggle();
  });
  if (writeToggle && form) writeToggle.addEventListener("click", () => {
    form.classList.toggle("review-form-open");
    form.classList.toggle("review-form-collapsed");
    if (form.classList.contains("review-form-open")) form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  if (form) form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.getElementById("reviewStatus");
    const submitBtn = document.getElementById("reviewSubmitBtn");
    const imageFile = document.getElementById("reviewImage")?.files?.[0];
    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = currentLang === "ar" ? "جاري نشر التقييم..." : "Publishing review...";

    let imageUrl = "";
    try {
      imageUrl = await uploadReviewImage(imageFile);
    } catch (error) {
      console.error(error);
      if (status) status.textContent = currentLang === "ar" ? "الصورة كبيرة أو غير صالحة." : "The image is too large or invalid.";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const review = {
      name: document.getElementById("reviewName").value.trim(),
      city: document.getElementById("reviewCity").value.trim(),
      rating: Number(document.getElementById("reviewRating").value),
      text: document.getElementById("reviewText").value.trim(),
      imageUrl,
      createdAtText: new Date().toLocaleDateString(currentLang === "ar" ? "ar-EG" : "en-GB")
    };

    try {
      if (liveReviewsEnabled && liveReviewsDb && window.modoFirestore) {
        await window.modoFirestore.addDoc(window.modoFirestore.collection(liveReviewsDb, "modoReviews"), {
          ...review,
          createdAt: window.modoFirestore.serverTimestamp()
        });
      } else {
        const saved = JSON.parse(localStorage.getItem("modoLocalReviews") || "[]");
        saved.unshift(review);
        localStorage.setItem("modoLocalReviews", JSON.stringify(saved.slice(0, 30)));
        renderLiveReviews(getLocalReviews());
      }
      form.reset();
      if (status) status.textContent = currentLang === "ar" ? "تم نشر تقييمك بنجاح." : "Your review was published.";
    } catch (error) {
      console.error(error);
      if (status) status.textContent = currentLang === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setupStickyCtaVisibility() {
  const sticky = document.querySelector(".sticky-mobile-cta");
  const hero = document.getElementById("home");
  const blockedSections = ["products", "reviews", "order"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!sticky || !hero) return;
  const update = () => {
    const heroPassed = hero.getBoundingClientRect().bottom < 80;
    const inBlockedSection = blockedSections.some(section => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.82 && rect.bottom > 120;
    });
    const showSticky = heroPassed && !inBlockedSection;
    sticky.classList.toggle("show", showSticky);
    document.body.classList.toggle("sticky-cta-visible", showSticky);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupOrderForm() {
  const form = document.getElementById("orderForm");
  const productSelect = document.getElementById("productSelect");
  const deliverySelect = document.getElementById("deliveryRegion");
  if (!form) return;
  productSelect?.addEventListener("change", () => {
    checkoutCartMode = false;
    selectedProductId = productSelect.value;
    updateSelectedProduct();
  });
  deliverySelect?.addEventListener("change", () => {
    selectedDeliveryRegion = deliverySelect.value;
    updateCheckoutTotal();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const items = getCheckoutItems();
    const product = getProduct(selectedProductId);
    const deliveryRegion = getDeliveryRegion();
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const payment = document.getElementById("paymentMethod").value;
    const notes = document.getElementById("customerNotes").value.trim() || "-";
    const subtotal = getCheckoutSubtotal();
    const total = subtotal + getEffectiveDeliveryFee();
    const productName = items.length > 1 || checkoutCartMode
      ? `${t("cartModeLabel")} (${items.reduce((sum, item) => sum + item.qty, 0)} ${currentLang === "ar" ? "قطعة" : "items"})`
      : product[currentLang].name;
    const productLines = items.map(({ product: itemProduct, qty }) =>
      `${itemProduct[currentLang].name} x${qty} - ${itemProduct.price * qty} EGP`
    ).join("\n");

    if (typeof fbq === "function") {
      fbq("track", "Lead", { content_name: productName, content_ids: items.map(item => item.product.id), content_type: "product", currency: "EGP", value: total });
      fbq("trackCustom", "WhatsAppOrderClick", { product: productName, product_id: items.map(item => item.product.id).join(","), currency: "EGP", value: total });
    }

    const success = document.getElementById("orderSuccess");
    if (success) {
      success.hidden = false;
      success.textContent = t("orderSuccess");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      product_name: productName,
      payment_method: payment,
      delivery_region: deliveryRegion[currentLang],
      delivery_fee: getEffectiveDeliveryText(),
      delivery_fee_display: getEffectiveDeliveryText(),
      price: subtotal,
      total,
      products: productLines,
      notes,
      language: currentLang === "ar" ? "Arabic" : "English",
      whatsapp_phone: normalizeEgyptPhoneForWhatsApp(phone),
      order_time: new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" }),
      to_email: "youssifKarim12@gmail.com",
      email: "youssifKarim12@gmail.com",
      reply_to: "youssifKarim12@gmail.com"
    };

    const msg = encodeURIComponent(`🛍️ New Modo Order

Product: ${productName}
Products:
${productLines}
Subtotal: ${subtotal} EGP
Delivery Area: ${deliveryRegion[currentLang]}
Delivery Fee: ${getEffectiveDeliveryText()}
Total: ${total} EGP

Name: ${name}
Phone: ${phone}
Address: ${address}
Payment: ${payment}
Notes: ${notes}`);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    const whatsappTab = window.open(whatsappUrl, "_blank");
    if (!whatsappTab) window.location.href = whatsappUrl;

    sendOrderEmailViaEmailJS(orderData).then(emailSent => {
      if (!emailSent) console.warn("Order email did not send, but WhatsApp was opened.");
    });
  });
}

function setupPremiumSectionOrder() {
  document.querySelector(".trust-strip-section")?.remove();
  document.querySelector(".conversion-band-section")?.remove();
  if (!isCheckoutPage()) document.querySelector(".order-section")?.remove();
  document.querySelector(".why-modo-section")?.remove();
  document.querySelector(".ugc-section")?.remove();
  document.querySelector(".comparison-section")?.remove();
  document.querySelector(".comparison-in-why")?.remove();
}

function createCheckoutSectionTitle(number, key) {
  const title = document.createElement("div");
  title.className = "checkout-section-title";
  title.innerHTML = `<span>${number}</span><h2 data-i18n="${key}">${t(key)}</h2>`;
  return title;
}

function setupCheckoutClarity() {
  const form = document.getElementById("orderForm");
  if (!isCheckoutPage() || !form || form.dataset.clarityReady) return;
  form.dataset.clarityReady = "true";

  const selectedCard = document.getElementById("selectedProductCard");
  selectedCard?.insertAdjacentElement("beforebegin", createCheckoutSectionTitle("01", "checkoutProductTitle"));

  const customerGrid = document.getElementById("customerName")?.closest(".form-grid");
  customerGrid?.insertAdjacentElement("beforebegin", createCheckoutSectionTitle("02", "checkoutCustomerTitle"));

  const deliveryGrid = document.getElementById("deliveryRegion")?.closest(".form-grid");
  deliveryGrid?.insertAdjacentElement("beforebegin", createCheckoutSectionTitle("03", "checkoutDeliveryTitle"));

  const totalBox = document.getElementById("checkoutTotalBox");
  totalBox?.insertAdjacentElement("beforebegin", createCheckoutSectionTitle("04", "checkoutReviewTitle"));

  const submit = form.querySelector(".order-submit");
  if (submit && !document.getElementById("checkoutConfirmNote")) {
    const note = document.createElement("p");
    note.id = "checkoutConfirmNote";
    note.className = "checkout-confirm-note";
    note.dataset.i18n = "checkoutConfirmNote";
    note.textContent = t("checkoutConfirmNote");
    submit.insertAdjacentElement("afterend", note);
  }
}

function setupCheckoutDesktopSummaryPlacement() {
  const form = document.getElementById("orderForm");
  const totalBox = document.getElementById("checkoutTotalBox");
  const deliverySelect = document.getElementById("deliveryRegion");
  const paymentSelect = document.getElementById("paymentMethod");
  if (!isCheckoutPage() || !form || !totalBox || !deliverySelect) return;

  const deliveryColumn = deliverySelect.closest(".form-grid > div");
  const paymentColumn = paymentSelect?.closest(".form-grid > div");
  if (!deliveryColumn) return;

  deliveryColumn.classList.add("checkout-delivery-column");
  paymentColumn?.classList.add("checkout-payment-column");

  let marker = document.getElementById("checkoutTotalOriginalMarker");
  const reviewTitle = Array.from(form.querySelectorAll(".checkout-section-title"))
    .find(title => title.querySelector('[data-i18n="checkoutReviewTitle"]'));

  if (!marker) {
    marker = document.createElement("span");
    marker.id = "checkoutTotalOriginalMarker";
    marker.hidden = true;
    (reviewTitle || totalBox).insertAdjacentElement("beforebegin", marker);
  }

  function placeSummary() {
    const isDesktop = window.matchMedia("(min-width: 981px)").matches;
    if (isDesktop) {
      if (reviewTitle) deliveryColumn.appendChild(reviewTitle);
      deliveryColumn.appendChild(totalBox);
    } else {
      if (reviewTitle) marker.insertAdjacentElement("afterend", reviewTitle);
      if (reviewTitle) reviewTitle.insertAdjacentElement("afterend", totalBox);
      else marker.insertAdjacentElement("afterend", totalBox);
    }
  }

  placeSummary();
  window.addEventListener("resize", placeSummary);
}

function setupHeroVideoControls() {
  const card = document.getElementById("heroVideoCard");
  const close = card?.querySelector(".hero-video-close");
  const video = card?.querySelector("video");
  if (!card || !close) return;

  close.addEventListener("click", () => {
    if (video) video.pause();
    card.hidden = true;
  });
}

document.getElementById("langToggle")?.addEventListener("click", () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem("modoLang", currentLang);
  applyTranslations();
});

window.chooseProduct = chooseProduct;

const requestedProduct = new URLSearchParams(window.location.search).get("product");
if (requestedProduct && products.some(product => product.id === requestedProduct)) {
  selectedProductId = requestedProduct;
}

setupCartNav();
setupCheckoutClarity();
setupCheckoutDesktopSummaryPlacement();
applyTranslations();
setupPremiumSectionOrder();
setupHeroVideoControls();
setupGallery();
setupMenu();
setupReveal();
setupReviews();
initLiveReviews();
setupStickyCtaVisibility();
setupOrderForm();

