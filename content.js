/* =====================================================================
   TREŚĆ STRONY – EDYTUJ TEN PLIK
   =====================================================================
   Linki do video: plik .mp4 (najlepiej), YouTube, Vimeo, Instagram, TikTok.
   Puste pole "video" = na stronie pokazuje się zaprojektowany placeholder.
   "poster" = kadr (obrazek .jpg) pokazywany przed odtworzeniem.
   ===================================================================== */

const CONTENT = {

  /* ---------- Twoje video w hero (poziome 16:9, 45–90 sekund) ---------- */
  founder: {
    video: '',
    poster: '',
    duration: '1:12',
    // Rozdziały pokazują się pod odtwarzaczem. Czas w sekundach.
    chapters: [
      { t: 0,  label: 'Kim jestem i co robię' },
      { t: 18, label: 'Jak wygląda miesiąc współpracy' },
      { t: 41, label: 'Na czym polega gwarancja' },
      { t: 58, label: 'Co się dzieje po konsultacji' }
    ]
  },

  /* ---------- Opinie video klientów (pionowe 9:16, 30–60 sekund) ----------
     Masz 3 nagrane, dodaj kolejne kopiując blok. Układ działa dla 3–5. */
  testimonials: [
    {
      name: 'Marta Zielińska',
      business: 'Studio urody Zielińska',
      city: 'Poznań',
      quote: 'Miałam luki w kalendarzu w środku tygodnia. Po trzech miesiącach mam listę oczekujących.',
      result: '+280% rezerwacji z Instagrama',
      video: '',
      poster: ''
    },
    {
      name: 'Tomasz Bąk',
      business: 'Restauracja Bąk & Syn',
      city: 'Kraków',
      quote: 'Przyjeżdża, nagrywamy trzy godziny, a potem przez miesiąc mam spokój. Weekendy pełne.',
      result: '540 tys. wyświetleń jednej rolki',
      video: '',
      poster: ''
    },
    {
      name: 'Paweł Sikora',
      business: 'Sikora IT',
      city: 'Wrocław',
      quote: 'Nie wierzyłem w gwarancję. Piąty miesiąc: 610 tysięcy wyświetleń i zapytania z komentarzy.',
      result: '142 zapytania ofertowe',
      video: '',
      poster: ''
    }
  ],

  /* ---------- Realizacje: klienci i ich rolki ---------- */
  cases: [
    {
      name: 'Studio urody Zielińska',
      industry: 'Beauty',
      city: 'Poznań',
      months: 8,
      platforms: ['Instagram', 'TikTok'],
      results: [
        { value: '2,4 mln', label: 'wyświetleń' },
        { value: '+11 200', label: 'obserwujących' },
        { value: '+280%', label: 'rezerwacji' }
      ],
      reels: [
        { title: 'Metamorfoza w 40 sekund', views: 486000, platform: 'Instagram', video: '', poster: '', tone: 1 },
        { title: '3 błędy przy pielęgnacji', views: 213000, platform: 'TikTok', video: '', poster: '', tone: 2 },
        { title: 'Dzień z życia salonu', views: 158000, platform: 'Instagram', video: '', poster: '', tone: 3 }
      ]
    },
    {
      name: 'Restauracja Bąk & Syn',
      industry: 'Gastronomia',
      city: 'Kraków',
      months: 6,
      platforms: ['Instagram', 'Facebook', 'TikTok'],
      results: [
        { value: '1,7 mln', label: 'wyświetleń' },
        { value: '+9 800', label: 'obserwujących' },
        { value: '+64%', label: 'rezerwacji weekendowych' }
      ],
      reels: [
        { title: 'Szef kuchni ocenia fast food', views: 540000, platform: 'TikTok', video: '', poster: '', tone: 4 },
        { title: 'Pierogi od zera', views: 312000, platform: 'Instagram', video: '', poster: '', tone: 5 },
        { title: 'Nowe menu w 30 sekund', views: 97000, platform: 'Facebook', video: '', poster: '', tone: 6 }
      ]
    },
    {
      name: 'Sikora IT',
      industry: 'Usługi B2B',
      city: 'Wrocław',
      months: 12,
      platforms: ['TikTok', 'YouTube', 'Instagram'],
      results: [
        { value: '3,1 mln', label: 'wyświetleń' },
        { value: '+38 400', label: 'obserwujących' },
        { value: '142', label: 'zapytań ofertowych' }
      ],
      reels: [
        { title: '3 błędy, które kosztują Cię klientów', views: 1100000, platform: 'TikTok', video: '', poster: '', tone: 2 },
        { title: 'Ile kosztuje wyciek danych?', views: 420000, platform: 'YouTube', video: '', poster: '', tone: 1 },
        { title: 'Audyt w 60 sekund', views: 188000, platform: 'Instagram', video: '', poster: '', tone: 5 }
      ]
    }
  ]
};
