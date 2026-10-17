import {
  Book, Category, Wilaya, Order, AbandonedCart, Customer,
  LandingPageConfig, PixelSettings, ChargilyConfig, EpubSettings,
  StoreSettings, Article, VideoItem, SocialLinks
} from '../types';

export const INITIAL_WILAYAS: Wilaya[] = [
  { id: 1, code: '01', nameAr: 'أدرار', nameFr: 'Adrar', homeDeliveryFee: 1100, deskDeliveryFee: 800, isAvailable: true },
  { id: 2, code: '02', nameAr: 'الشلف', nameFr: 'Chlef', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 3, code: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', homeDeliveryFee: 800, deskDeliveryFee: 550, isAvailable: true },
  { id: 4, code: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 5, code: '05', nameAr: 'باتنة', nameFr: 'Batna', homeDeliveryFee: 700, deskDeliveryFee: 450, isAvailable: true },
  { id: 6, code: '06', nameAr: 'بجاية', nameFr: 'Béjaïa', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 7, code: '07', nameAr: 'بسكرة', nameFr: 'Biskra', homeDeliveryFee: 800, deskDeliveryFee: 550, isAvailable: true },
  { id: 8, code: '08', nameAr: 'بشار', nameFr: 'Béchar', homeDeliveryFee: 1000, deskDeliveryFee: 750, isAvailable: true },
  { id: 9, code: '09', nameAr: 'البليدة', nameFr: 'Blida', homeDeliveryFee: 500, deskDeliveryFee: 350, isAvailable: true },
  { id: 10, code: '10', nameAr: 'البويرة', nameFr: 'Bouira', homeDeliveryFee: 550, deskDeliveryFee: 400, isAvailable: true },
  { id: 11, code: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', homeDeliveryFee: 1300, deskDeliveryFee: 950, isAvailable: true },
  { id: 12, code: '12', nameAr: 'تبسة', nameFr: 'Tébessa', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 13, code: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 14, code: '14', nameAr: 'تيارت', nameFr: 'Tiaret', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 15, code: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', homeDeliveryFee: 550, deskDeliveryFee: 400, isAvailable: true },
  { id: 16, code: '16', nameAr: 'الجزائر العاصمة', nameFr: 'Alger', homeDeliveryFee: 400, deskDeliveryFee: 250, isAvailable: true },
  { id: 17, code: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 18, code: '18', nameAr: 'جيجل', nameFr: 'Jijel', homeDeliveryFee: 700, deskDeliveryFee: 450, isAvailable: true },
  { id: 19, code: '19', nameAr: 'سطيف', nameFr: 'Sétif', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 20, code: '20', nameAr: 'سعيدة', nameFr: 'Saïda', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 21, code: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', homeDeliveryFee: 700, deskDeliveryFee: 450, isAvailable: true },
  { id: 22, code: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 23, code: '23', nameAr: 'عنابة', nameFr: 'Annaba', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 24, code: '24', nameAr: 'قالمة', nameFr: 'Guelma', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 25, code: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', homeDeliveryFee: 600, deskDeliveryFee: 400, isAvailable: true },
  { id: 26, code: '26', nameAr: 'المدية', nameFr: 'Médéa', homeDeliveryFee: 550, deskDeliveryFee: 400, isAvailable: true },
  { id: 27, code: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 28, code: '28', nameAr: 'المسيلة', nameFr: 'M\'Sila', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 29, code: '29', nameAr: 'معسكر', nameFr: 'Mascara', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 30, code: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', homeDeliveryFee: 900, deskDeliveryFee: 650, isAvailable: true },
  { id: 31, code: '31', nameAr: 'وهران', nameFr: 'Oran', homeDeliveryFee: 600, deskDeliveryFee: 400, isAvailable: true },
  { id: 32, code: '32', nameAr: 'البيض', nameFr: 'El Bayadh', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 33, code: '33', nameAr: 'إليزي', nameFr: 'Illizi', homeDeliveryFee: 1400, deskDeliveryFee: 1000, isAvailable: true },
  { id: 34, code: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 35, code: '35', nameAr: 'بومرداس', nameFr: 'Boumerdès', homeDeliveryFee: 500, deskDeliveryFee: 350, isAvailable: true },
  { id: 36, code: '36', nameAr: 'الطارف', nameFr: 'El Tarf', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 37, code: '37', nameAr: 'تندوف', nameFr: 'Tindouf', homeDeliveryFee: 1400, deskDeliveryFee: 1000, isAvailable: true },
  { id: 38, code: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 39, code: '39', nameAr: 'الوادي', nameFr: 'El Oued', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 40, code: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 41, code: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', homeDeliveryFee: 750, deskDeliveryFee: 500, isAvailable: true },
  { id: 42, code: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', homeDeliveryFee: 500, deskDeliveryFee: 350, isAvailable: true },
  { id: 43, code: '43', nameAr: 'ميلة', nameFr: 'Mila', homeDeliveryFee: 650, deskDeliveryFee: 450, isAvailable: true },
  { id: 44, code: '44', nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', homeDeliveryFee: 600, deskDeliveryFee: 400, isAvailable: true },
  { id: 45, code: '45', nameAr: 'النعامة', nameFr: 'Naâma', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 46, code: '46', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 47, code: '47', nameAr: 'غرداية', nameFr: 'Ghardaïa', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 48, code: '48', nameAr: 'غليزان', nameFr: 'Relizane', homeDeliveryFee: 700, deskDeliveryFee: 500, isAvailable: true },
  { id: 49, code: '49', nameAr: 'تيميمون', nameFr: 'Timimoun', homeDeliveryFee: 1200, deskDeliveryFee: 850, isAvailable: true },
  { id: 50, code: '50', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', homeDeliveryFee: 1500, deskDeliveryFee: 1100, isAvailable: true },
  { id: 51, code: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 52, code: '52', nameAr: 'بني عباس', nameFr: 'Béni Abbès', homeDeliveryFee: 1100, deskDeliveryFee: 800, isAvailable: true },
  { id: 53, code: '53', nameAr: 'إن صالح', nameFr: 'In Salah', homeDeliveryFee: 1300, deskDeliveryFee: 900, isAvailable: true },
  { id: 54, code: '54', nameAr: 'إن قزام', nameFr: 'In Guezzam', homeDeliveryFee: 1500, deskDeliveryFee: 1100, isAvailable: true },
  { id: 55, code: '55', nameAr: 'تقرت', nameFr: 'Touggourt', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 56, code: '56', nameAr: 'جانت', nameFr: 'Djanet', homeDeliveryFee: 1400, deskDeliveryFee: 1000, isAvailable: true },
  { id: 57, code: '57', nameAr: 'المغير', nameFr: 'El M\'Ghair', homeDeliveryFee: 850, deskDeliveryFee: 600, isAvailable: true },
  { id: 58, code: '58', nameAr: 'المنيعة', nameFr: 'El Menia', homeDeliveryFee: 950, deskDeliveryFee: 700, isAvailable: true }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'novels', name: 'روايات وأدب', nameFr: 'Romans & Littérature', iconName: 'BookOpen', count: 18, description: 'أرقى الإبداعات السردية والروايات المعاصرة المترجمة والمؤلفة' },
  { id: 'philosophy', name: 'دراسات وفلسفة', nameFr: 'Études & Philosophie', iconName: 'Compass', count: 12, description: 'أطروحات نقدية وفكرية تُضيء مسارات الفكر العربي والإنساني' },
  { id: 'history', name: 'تاريخ وتراث جزائري', nameFr: 'Histoire & Patrimoine', iconName: 'Landmark', count: 15, description: 'توثيق دقيق لتاريخ الجزائر وثوراتها وتراثها الفكري والحضاري' },
  { id: 'translations', name: 'ترجمات عالمية', nameFr: 'Traductions Mondiales', iconName: 'Globe', count: 10, description: 'نقل روائع الأدب العالمي إلى اللغة العربية بأقلام نخبة المترجمين' },
  { id: 'academic', name: 'كتب جامعية وأكاديمية', nameFr: 'Ouvrages Académiques', iconName: 'GraduationCap', count: 14, description: 'مراجع متخصصة لطلبة الماستر والدكتوراه والباحثين في شتى الحقول' },
  { id: 'children', name: 'أدب الناشئة والشباب', nameFr: 'Jeunesse', iconName: 'Sparkles', count: 8, description: 'قصص معرفية هادفة تبني خيال الأجيال الصاعدة وتثري لغتهم' }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'roum-001',
    title: 'رماد الأندلس: سيرة الغائبين',
    originalTitle: 'Cendres d\'Andalousie',
    author: 'د. طاهر بلحاج',
    translator: 'دار رميسة للنشر',
    category: 'novels',
    pricePrint: 1450,
    priceEpub: 650,
    hasEpub: true,
    epubFileName: 'ramad_alandalus_roumaissa.epub',
    epubFileSize: '3.8 MB',
    coverColor: '#881337',
    coverAccent: '#fbbf24',
    coverPattern: 'arabesque',
    isbn: '978-9931-74-102-4',
    pages: 368,
    publishYear: 2026,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الثانية المنقحة',
    rating: 4.9,
    reviewsCount: 84,
    summary: 'رواية ملحمية تتتبع مخطوطاً مفقوداً نُقل سراً من غرناطة بعد سقوطها ليعبر موانئ الجزائر ووهران، كاشفاً حكايات الحب والمنفى والذاكرة التي لا تموت بين ضفتي المتوسط.',
    excerpt: 'كان المساء يتهادى على أزقة حي القصبة، حين فتح الشيخ إبراهيم صرة القماش العتيق. انبعثت رائحة الزعفران والورق المعتّق، وتجلت الحروف الأندلسية المكتوبة بمداد السواد الإشبيلي. قال وهو يمسح على أطراف الصفحة: "يا بني، هذا المخطوط ليس مجرد سيرة، بل هو أنفاس أولئك الذين رفضوا أن تموت لغتهم في ليل النسيان..."',
    toc: [
      'مقدمة المترجم والناشر',
      'الفصل الأول: رياح البيازين الأخيرة',
      'الفصل الثاني: الميناء وسفينة الغرباء',
      'الفصل الثالث: زوايا وهران القديمة',
      'الفصل الرابع: حبر المخطوط السري',
      'الفصل الخامس: أنفاس في حضرة القصبة',
      'خاتمة: شمس لا تغيب عن الذاكرة'
    ],
    stock: 45,
    stockCount: 45,
    isBestseller: true,
    isFeatured: true,
    tags: ['رواية تاريخية', 'الأندلس', 'أدب جزائري', 'إصدار حصري']
  },
  {
    id: 'roum-002',
    title: 'فلسفة الترجمة والغيرية الثقافية',
    author: 'أ.د. سميرة عماري',
    category: 'philosophy',
    pricePrint: 1800,
    priceEpub: 800,
    hasEpub: true,
    epubFileName: 'philosophie_traduction_roumaissa.epub',
    epubFileSize: '4.2 MB',
    coverColor: '#064e3b',
    coverAccent: '#fef08a',
    coverPattern: 'geometric',
    isbn: '978-9931-74-108-6',
    pages: 420,
    publishYear: 2026,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الأولى',
    rating: 4.8,
    reviewsCount: 39,
    summary: 'بحث فلسفي معمق يناقش حدود الترجمة بوصفها فعلاً أخلاقياً وضيافة للآخر، مع دراسة مقارنة لتجارب الترجمة الجزائرية في الفكر المعاصر.',
    excerpt: 'ليست الترجمة نقلاً ميكانيكياً بين معجمين، بل هي مغامرة وجودية لاحتضان الغريب وإسكانه في رحاب لغتنا الوطنية دون تدجين هويته الأصلية.',
    toc: [
      'المدخل: أزمة الترجمة في عالم معولم',
      'المبحث الأول: مفهوم الضيافة اللغوية عند بول ريكور',
      'المبحث الثاني: الجدل بين التعريب والأصالة',
      'المبحث الثالث: الخطاب الفلسفي الجزائري وتحدي التعدد اللغوي',
      'الخاتمة: نحو نظرية نقدية للترجمة في الجنوب العالمي'
    ],
    stock: 30,
    stockCount: 30,
    isNewRelease: true,
    isFeatured: true,
    tags: ['فلسفة', 'ترجمة', 'فكر معاصر', 'دراسات عليا']
  },
  {
    id: 'roum-003',
    title: 'تاريخ المخطوطات والوثائق الجزائرية',
    author: 'د. رابح بن عثمان',
    category: 'history',
    pricePrint: 2200,
    priceEpub: 950,
    hasEpub: true,
    epubFileName: 'algerian_manuscripts_history.epub',
    epubFileSize: '6.1 MB',
    coverColor: '#1e3a8a',
    coverAccent: '#fde047',
    coverPattern: 'classic',
    isbn: '978-9931-74-115-4',
    pages: 512,
    publishYear: 2025,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الفاخرة المجلدة',
    rating: 5.0,
    reviewsCount: 52,
    summary: 'مرجع وثائقي مصور يرصد خزائن المخطوطات في زوايا أدرار وتيميمون وتلمسان وقسنطينة، مع نصوص غير منشورة وفهرسة علمية محكمة.',
    excerpt: 'تعد خزائن توات وتيميمون من أعظم مستودعات الذاكرة المغاربية والإفريقية، حيث حفظت عبر رمال الصحراء وثائق فقهية وفلكية وأدبية امتدت لخمسة قرون.',
    toc: [
      'الباب الأول: جغرافية الخزائن في صحراء الجزائر',
      'الباب الثاني: فن الوراقة وصناعة الأحبار المحلية',
      'الباب الثالث: الإجازات العلمية وشبكات العلماء',
      'الباب الرابع: فهرس الوثائق النادرة المسترجعة'
    ],
    stock: 22,
    stockCount: 22,
    isBestseller: true,
    tags: ['تاريخ الجزائر', 'مخطوطات', 'تراث', 'توثيق']
  },
  {
    id: 'roum-004',
    title: 'أصداء القصبة العتيقة: سيرة المكان والإنسان',
    author: 'الروائية نادية مصمودي',
    category: 'novels',
    pricePrint: 1250,
    priceEpub: 500,
    hasEpub: true,
    epubFileName: 'echoes_casbah_roumaissa.epub',
    epubFileSize: '2.9 MB',
    coverColor: '#78350f',
    coverAccent: '#fef3c7',
    coverPattern: 'minimal',
    isbn: '978-9931-74-122-2',
    pages: 280,
    publishYear: 2026,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الأولى',
    rating: 4.7,
    reviewsCount: 61,
    summary: 'حكايات دافئة من شرفات القصبة وبساتين باب الواد، تروي تفاصيل الحياة اليومية والتقاليد والموسيقى الأندلسية في ستينيات القرن الماضي.',
    excerpt: 'حين يعزف صوت العود في وسط الدار، يتوقف الزمن في أزقة القصبة المرصوفة بالحجر الصوان، وتطل الياسمينات من النوافذ الزرقاء لتشهد على حب بريء.',
    toc: [
      'المشهد الأول: شمس الصباح على قصر خداوج العمياء',
      'المشهد الثاني: نداء الباعة ورائحة الفطائر والنعناع',
      'المشهد الثالث: أصابع العازف ونغم الصنعة',
      'المشهد الرابع: لقاءات الغروب على مدرجات البحر'
    ],
    stock: 50,
    stockCount: 50,
    isNewRelease: true,
    tags: ['رواية اجتماعية', 'القصبة', 'الجزائر العاصمة', 'ذاكرة']
  },
  {
    id: 'roum-005',
    title: 'رسائل إلى كاتب شاب: في فن الصنعة الأدبية',
    originalTitle: 'Lettres à un jeune écrivain',
    author: 'أنطوان دو لاغرانج',
    translator: 'ترجمة: فاروق بن خديجة',
    category: 'translations',
    pricePrint: 1100,
    priceEpub: 450,
    hasEpub: true,
    epubFileName: 'letters_young_writer_roumaissa.epub',
    epubFileSize: '2.1 MB',
    coverColor: '#312e81',
    coverAccent: '#c084fc',
    coverPattern: 'classic',
    isbn: '978-9931-74-130-7',
    pages: 196,
    publishYear: 2025,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الثانية',
    rating: 4.9,
    reviewsCount: 78,
    summary: 'دليل أدبي ملهم يقدم نصائح عملية ومكثفة لكل كاتب يبدأ مسيرته، حول الصبر وبناء الشخصيات وإيقاع الجملة والتعامل مع النقد.',
    excerpt: 'لا تكتب لتُعجب الآخرين يا صديقي، بل اكتب لأنك ستختنق إن لم تطلق تلك الكلمات التي تضطرم في وجدانك. الكتابة هي تمرين في الصدق الصارم.',
    toc: [
      'الرسالة الأولى: شجاعة البياض',
      'الرسالة الثانية: كيف تُنصت إلى نبض الشخصية',
      'الرسالة الثالثة: شطب الزوائد ونحت الجملة',
      'الرسالة الرابعة: العزلة بوصفها محراباً للإبداع'
    ],
    stock: 65,
    stockCount: 65,
    isBestseller: true,
    tags: ['ترجمات', 'فن الكتابة', 'نقد أدبي', 'إلهام']
  },
  {
    id: 'roum-006',
    title: 'مناهج البحث السيميائي في الخطاب الأدبي',
    author: 'د. بوعلام حيدوسي',
    category: 'academic',
    pricePrint: 1950,
    priceEpub: 850,
    hasEpub: true,
    epubFileName: 'semiotics_methodology_roumaissa.epub',
    epubFileSize: '5.4 MB',
    coverColor: '#0f172a',
    coverAccent: '#38bdf8',
    coverPattern: 'geometric',
    isbn: '978-9931-74-144-4',
    pages: 460,
    publishYear: 2026,
    publisher: 'دار رميسة للنشر والترجمة',
    editionNumber: 'الطبعة الأكاديمية الأولى',
    rating: 4.6,
    reviewsCount: 27,
    summary: 'مرجع تطبيقي لطلبة كليات الآداب واللغات في الجزائر والعالم العربي، يقدم نماذج تفكيكية وتحليلية للنصوص الروائية والشعرية.',
    excerpt: 'تجاوزت السيميائيات المعاصرة حدود النص المغلق لتنفتح على السياقات الثقافية والسوسيولوجية، مما يمنح الباحث أداة صارمة لتفكيك المعنى المضمر.',
    toc: [
      'الفصل التمهيدي: نشأة السيميائيات وأبرز مدارسها',
      'الفصل الأول: التحليل البنيوي الدلالي عند غريماس',
      'الفصل الثاني: سيميائية التلقي والتأويل عند إيكو',
      'الفصل الثالث: تطبيقات عملية على نماذج من الرواية المغاربية'
    ],
    stock: 0,
    stockCount: 0,
    tags: ['جامعي', 'نقد أدبي', 'سيميائيات', 'أبحاث']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ROUM-2026-1042',
    customerName: 'كريم قندوز',
    phone: '0550123456',
    email: 'karim.kendouz@gmail.com',
    wilayaId: 16,
    wilayaName: 'الجزائر العاصمة',
    commune: 'القبة',
    address: 'شارع فلسطين، عمارة 14 شقة 03',
    deliveryType: 'home',
    items: [
      { bookId: 'roum-001', title: 'رماد الأندلس: سيرة الغائبين', author: 'د. طاهر بلحاج', format: 'print', price: 1450, quantity: 1 },
      { bookId: 'roum-002', title: 'فلسفة الترجمة والغيرية الثقافية', author: 'أ.د. سميرة عماري', format: 'epub', price: 800, quantity: 1 }
    ],
    subtotal: 2250,
    shippingCost: 400,
    totalAmount: 2650,
    paymentMethod: 'chargily',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2026-10-14T10:30:00Z',
    chargilyPaymentId: 'ch_pay_994827103',
    downloadToken: 'dl_tok_84920482_epub',
    downloadCount: 2,
    notes: 'تم الدفع بنجاح عبر البطاقة الذهبية، تم تحميل ملف ePub'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ROUM-2026-1043',
    customerName: 'فاطمة الزهراء بن علي',
    phone: '0661987654',
    email: 'fatima.zohra@outlook.com',
    wilayaId: 31,
    wilayaName: 'وهران',
    commune: 'بئر الجير',
    address: 'حي العقيد لطفي، إقامة النخيل',
    deliveryType: 'home',
    items: [
      { bookId: 'roum-001', title: 'رماد الأندلس: سيرة الغائبين', author: 'د. طاهر بلحاج', format: 'print', price: 1450, quantity: 2 }
    ],
    subtotal: 2900,
    shippingCost: 600,
    totalAmount: 3500,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'shipping',
    createdAt: '2026-10-15T14:15:00Z',
    notes: 'الزبونة طلبت الاتصال قبل التوصيل بنصف ساعة'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ROUM-2026-1044',
    customerName: 'الأستاذ يوسف مرابط',
    phone: '0770456789',
    email: 'youssef.morabet@univ-constantine.dz',
    wilayaId: 25,
    wilayaName: 'قسنطينة',
    commune: 'الخروب',
    address: 'جامعة قسنطينة 1، كلية الآداب واللغات',
    deliveryType: 'desk',
    items: [
      { bookId: 'roum-003', title: 'تاريخ المخطوطات والوثائق الجزائرية', author: 'د. رابح بن عثمان', format: 'print', price: 2200, quantity: 1 },
      { bookId: 'roum-006', title: 'مناهج البحث السيميائي في الخطاب الأدبي', author: 'د. بوعلام حيدوسي', format: 'print', price: 1950, quantity: 1 }
    ],
    subtotal: 4150,
    shippingCost: 400,
    totalAmount: 4550,
    paymentMethod: 'chargily',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    createdAt: '2026-10-16T07:45:00Z',
    chargilyPaymentId: 'ch_pay_883019482',
    notes: 'تم الدفع بالبطاقة البنكية CIB'
  }
];

export const INITIAL_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'ab-201',
    customerName: 'ياسين بوقرة',
    phone: '0554332211',
    email: 'yassine.boug@gmail.com',
    wilayaName: 'سطيف',
    items: [
      { bookId: 'roum-001', title: 'رماد الأندلس: سيرة الغائبين', author: 'د. طاهر بلحاج', format: 'print', price: 1450, quantity: 1 }
    ],
    totalAmount: 2100,
    createdAt: '2026-10-16T06:12:00Z',
    recovered: false,
    reminderSent: false
  },
  {
    id: 'ab-202',
    customerName: 'مريم شلابي',
    phone: '0672118899',
    email: 'meriem.ch@yahoo.fr',
    wilayaName: 'تيزي وزو',
    items: [
      { bookId: 'roum-005', title: 'رسائل إلى كاتب شاب: في فن الصنعة الأدبية', author: 'أنطوان دو لاغرانج', format: 'epub', price: 450, quantity: 1 }
    ],
    totalAmount: 450,
    createdAt: '2026-10-15T21:40:00Z',
    recovered: false,
    reminderSent: true,
    reminderSentAt: '2026-10-16T08:00:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'كريم قندوز',
    phone: '0550123456',
    email: 'karim.kendouz@gmail.com',
    wilaya: 'الجزائر العاصمة',
    ordersCount: 3,
    totalSpent: 6800,
    registeredDate: '2026-08-12',
    lastOrderDate: '2026-10-14'
  },
  {
    id: 'cust-2',
    name: 'فاطمة الزهراء بن علي',
    phone: '0661987654',
    email: 'fatima.zohra@outlook.com',
    wilaya: 'وهران',
    ordersCount: 1,
    totalSpent: 3500,
    registeredDate: '2026-10-15',
    lastOrderDate: '2026-10-15'
  },
  {
    id: 'cust-3',
    name: 'الأستاذ يوسف مرابط',
    phone: '0770456789',
    email: 'youssef.morabet@univ-constantine.dz',
    wilaya: 'قسنطينة',
    ordersCount: 4,
    totalSpent: 12400,
    registeredDate: '2026-05-20',
    lastOrderDate: '2026-10-16'
  }
];

export const INITIAL_LANDING_PAGE: LandingPageConfig = {
  id: 'lp-andalus',
  slug: 'ramad-alandalus-offer',
  bookId: 'roum-001',
  isActive: true,
  heroHeadline: 'الرواية الأكثر مبيعاً في الجزائر لعام 2026: رماد الأندلس',
  heroSubheadline: 'ملحمة أدبية تأسر الألباب بين موانئ الأندلس وأزقة القصبة العتيقة. طبعة خاصة محدودة مع هدية مادية وخصم حصري!',
  urgencyBanner: 'عرض محدود: خصم 20% + توصيل مخفض وتوقيع الكاتب لأول 100 طلب فقط!',
  countdownMinutes: 28,
  discountPercentage: 20,
  guaranteeText: 'ضمان استرجاع أو استبدال فوري عند وجود أي عيب طباعي · الدفع عند الاستلام بعد تفحص الكتاب',
  featuresList: [
    'تجليد فاخر بورق شمواه إيطالي مريح للعين',
    'نسخة رقمية ePub مجانية إضافية مرفقة مع كل كتاب ورقي',
    'فاصل كتب تذكاري مطلي بماء الذهب يحمل نقوش قصر الحمراء',
    'توصيل سريع لباب المنزل في 58 ولاية جزائرية خلال 24-48 ساعة'
  ]
};

export const INITIAL_PIXEL_SETTINGS: PixelSettings = {
  facebookPixelId: '109283746592019',
  tiktokPixelId: 'C789102X90Y1',
  googleAnalyticsId: 'G-ROUM99482',
  snapchatPixelId: '',
  isEnabled: true
};

export const INITIAL_CHARGILY_CONFIG: ChargilyConfig = {
  publicKey: 'test_pk_roumaissa_edition_live_4992019',
  secretKey: 'test_sk_secret_roumaissa_charge_8830114',
  webhookSecret: 'whsec_9930281048291048',
  testMode: true,
  isConnected: true,
  autoConfirmEpub: true
};

export const INITIAL_EPUB_SETTINGS: EpubSettings = {
  allowInstantBrowserPreview: true,
  maxDownloadAttempts: 5,
  linkExpiryHours: 72,
  watermarkCustomerInfo: true,
  publisherStampText: 'نسخة رقمية مرخصة ومحمية بحقوق النشر - دار رميسة للنشر والترجمة والجزائر'
};

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'دار رميسة للنشر والترجمة والتوزيع',
  storeNameFr: 'Roumaissa Édition & Traduction',
  tagline: 'حيث تلتقي عراقة الفكر بألق الكلمة والترجمات العالمية',
  phone: '+213 21 89 45 12',
  whatsappNumber: '+213 550 12 34 56',
  email: 'roumaissaeditionettraduction@gmail.com',
  address: 'شارع العربي بن مهيدي، الجزائر العاصمة - الجمهورية الجزائرية الديمقراطية الشعبية',
  freeShippingThreshold: 6000,
  announcementNotice: 'شحن مجاني لكافة الولايات عند الطلب بمبلغ 6000 دج أو أكثر! · متوفر الآن الشراء بالبطاقة الذهبية و CIB',
  showAnnouncement: true,
  heroQuote: 'الكتب هي أقدام الروح التي تسافر بها عبر العصور، والترجمة هي جناحها الذي تعبر به آفاق الشعوب.',
  heroQuoteAuthor: 'دار رميسة'
};

// Initial Cultural & Literary Articles (Protected against copying)
export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'في صنعة الترجمة الأدبية: حين يتحول المترجم إلى مؤلف ثانٍ',
    slug: 'art-of-literary-translation',
    excerpt: 'قراءة نقدية في آليات نقل الأبعاد الدلالية والإيقاعية بين اللغات دون خيانة روح النص الأصلي.',
    content: `ليست الترجمة مجرد جسر ميكانيكي ينقل الكلمات من ضفة معجمية إلى أخرى، بل هي مغامرة وجودية يخوضها المترجم في تضاريس النص الغريب ليمنحه حياة جديدة في لغته القومية.

في دار رميسة للنشر والترجمة، نؤمن بأن كل نص أدبي يحمل في طياته موسيقى خفية، وبنية ثقافية لا يمكن فك شفراتها إلا بوعي عميق بسياقاتها التاريخية والفلسفية. وحين يتصدى المترجم لنص كلاسيكي، فإن مسؤوليته تتجاوز الدقة الحرفية لتصل إلى استحضار النبرة، والرائحة، وحرارة المشاعر التي بثها المؤلف الأصلي في أوتار لغته.

تتطلب الترجمة الناجحة شجاعة التحرر من أسر الحرفية العقيمة، والارتقاء إلى مستوى "الضيافة اللغوية" كما عبر عنها الفيلسوف بول ريكور؛ أي أن نسكن لغة الآخر في رحاب لغتنا دون طمس خصوصيته، ودون إفقار مخزوننا التعبيري.

إن تجربة الترجمة الأدبية في الجزائر تمتلك ثراءً استثنائياً بحكم موقعنا الحضاري وتعددنا اللغوي والتاريخي، مما يجعل من مشاريع الترجمة في دار رميسة نافذة مشرعة على حوار الثقافات، وتجديداً متواصلاً لروح اللغة العربية وأدواتها التعبيرية المعاصرة.`,
    author: 'أ.د. سميرة عماري',
    authorRole: 'أستاذة الترجمة والفلسفة النقدية',
    category: 'دراسات وترجمات',
    publishDate: '15 أكتوبر 2026',
    readTime: '4 دقائق',
    coverColor: '#064e3b',
    tags: ['الترجمة الأدبية', 'نقد فكري', 'دار رميسة', 'الأدب العالمي'],
    views: 428,
    isCopyProtected: true
  },
  {
    id: 'art-2',
    title: 'تاريخ الوراقة والمخطوطات في صحراء الجزائر: أسرار خزائن توات وتيميمون',
    slug: 'history-manuscripts-algerian-sahara',
    excerpt: 'توثيق تاريخي للمهارات الحرفية وصناعة الأحبار المنسية التي حفظت تراث الجزائر الفكري لقرون.',
    content: `لم تكن الصحراء الجزائرية يوماً فضاءً قاحلاً، بل كانت شرياناً نابضاً بالعلم، ومستودعاً لحضارة مداد خطت على أوراق الشمواه والرقوق عبر قوافل وادي ميزاب وتوات وتيميمون وأدرار.

يرصد الباحث في تاريخ المخطوطات الجزائرية تفرد الوراقة المحلية، حيث ابتكر النساخ الجزائريون أحباراً خاصة مقاومة لرطوبة الواحات وحرارة الرمال، مستخرجة من صمغ الطلح وقشور الرمان وأملاح المعادن الصحراوية، مما مكن آلاف المجلدات الفقهية والفلكية والأدبية من الصمود لأكثر من خمسة قرون.

في هذا السياق، تواصل دار رميسة للنشر مشروعها الوطني لتوثيق هذه الخزائن وفهرستها علمياً، وتحويل تلك الكنوز المغمورة إلى مؤلفات محققة وطبعات فاخرة، إضافة إلى إتاحتها رقمياً بصيغة ePub لتكون في متناول الباحثين عبر العالم.`,
    author: 'د. رابح بن عثمان',
    authorRole: 'باحث في التراث والمخطوطات المغاربية',
    category: 'تاريخ وتراث',
    publishDate: '12 أكتوبر 2026',
    readTime: '5 دقائق',
    coverColor: '#1e3a8a',
    tags: ['مخطوطات', 'تاريخ الجزائر', 'أدرار', 'تراث وثائقي'],
    views: 612,
    isCopyProtected: true
  },
  {
    id: 'art-3',
    title: 'لماذا نقرأ الرواية التاريخية اليوم؟ تأملات حول ملحمة «رماد الأندلس»',
    slug: 'why-we-read-historical-fiction',
    excerpt: 'كيف يستعيد السرد الروائي نبض الذاكرة الغائبة ويبعث في الحاضر بصيرة استشراف المستقبل.',
    content: `ليست الرواية التاريخية نوستالجيا باردة للبكاء على أطلال الماضي، بل هي مرآة مشحونة بالأسئلة الملحة التي يطرحها إنسان الحاضر على مصيره المشترك.

حين كتبنا "رماد الأندلس"، لم يكن القصد تكرار الرواية الأكاديمية لحروب الاسترداد وسقوط غرناطة، بل البحث عن ذلك الإنساني البسيط: الحائك، والوراق، والشاعر، والعاشقة الذين اضطروا إلى ركوب البحر نحو موانئ الجزائر، حاملين في صدورهم مفاتيح بيوتهم وبذور ياسمينهم وكتبهم السرية.

إن قوة الرواية تكمن في قدرتها على إحياء التفاصيل الصغيرة التي تهملها كتب التاريخ الرسمية: رائحة الخبز في أزقة القصبة فجر وصول الأندلسيين، نغمات الزجل التي تمازجت مع إيقاع البحر، والوفاء الشجاع للكلمة المكتوبة.`,
    author: 'د. طاهر بلحاج',
    authorRole: 'روائي وأكاديمي جزائري',
    category: 'إضاءات نقدية',
    publishDate: '08 أكتوبر 2026',
    readTime: '3 دقائق',
    coverColor: '#881337',
    tags: ['رواية تاريخية', 'رماد الأندلس', 'أدب جزائري'],
    views: 890,
    isCopyProtected: true
  }
];

// Initial Cultural & Publishing Videos
export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'ندوة توقيع رواية «رماد الأندلس» بحضور المؤلف والنقاد في الجزائر العاصمة',
    description: 'تسجيل كامل للجلسة الحوارية المفتوحة مع الدكتور طاهر بلحاج ومناقشة تفاصيل حبكة المخطوط المفقود وتاريخ القصبة.',
    youtubeId: '3JZ_D3ELwOQ',
    duration: '24:15',
    presenter: 'د. طاهر بلحاج وإدارة د. سميرة عماري',
    publishDate: '14 أكتوبر 2026',
    views: 1420,
    category: 'ندوات ولقاءات',
    isFeatured: true
  },
  {
    id: 'vid-2',
    title: 'وثائقي دار رميسة: أسرار صناعة الكتاب الورقي الفاخر والتحول الرقمي ePub',
    description: 'جولة ميدانية داخل مطابع دار رميسة وخطوات اختيار الورق الشمواه الإيطالي والتجليد اليدوي وتشفير ملفات ePub.',
    youtubeId: 'L_LUpnjgPso',
    duration: '12:40',
    presenter: 'فريق الإنتاج الفني لدار رميسة',
    publishDate: '10 أكتوبر 2026',
    views: 980,
    category: 'وثائقيات الدار',
    isFeatured: true
  },
  {
    id: 'vid-3',
    title: 'برنامج حواري: أثر الترجمات العالمية الحديثة في إثراء المكتبة الجزائرية',
    description: 'نقاش فكري حول مشروع ترجمة روائع الفكر العالمي ونقلها للغة العربية بأسلوب أدبي رصين.',
    youtubeId: 'kJQP7kiw5Fk',
    duration: '18:50',
    presenter: 'أ. فاروق بن خديجة ود. بوعلام حيدوسي',
    publishDate: '05 أكتوبر 2026',
    views: 750,
    category: 'فكر وترجمة'
  }
];

// Initial Social Media Links & WhatsApp Settings
export const INITIAL_SOCIAL_LINKS: SocialLinks = {
  facebook: 'https://facebook.com/roumaissa.edition',
  instagram: 'https://instagram.com/roumaissa_edition',
  tiktok: 'https://tiktok.com/@roumaissa.edition',
  youtube: 'https://youtube.com/@roumaissa-edition',
  twitter: 'https://x.com/roumaissa_ed',
  telegram: 'https://t.me/roumaissa_edition',
  whatsappNumber: '+213550123456',
  whatsappDefaultMsg: 'مرحباً دار رميسة للنشر والترجمة، أود الاستفسار عن توفر الكتب وخدمة التوصيل...',
  showFloatingWhatsApp: true,
  antiCopyGlobalEnabled: true
};
