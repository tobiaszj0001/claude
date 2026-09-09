/* =====================================================================
   PORTFOLIO – EDYTUJ TEN PLIK, ŻEBY DODAĆ KLIENTÓW I ROLKI
   =====================================================================
   Każdy klient ma listę rolek. Rolka pojawia się w widoku "Według klientów"
   (przy swoim kliencie) oraz w widoku "Pojedyncze rolki" (wszystkie razem).

   Pola rolki:
     title    – krótki tytuł
     views    – liczba wyświetleń (liczba, np. 486000)
     platform – "Instagram" | "TikTok" | "Facebook" | "YouTube"
     video    – link do rolki (Instagram/TikTok/YouTube) – po kliknięciu otwiera się w odtwarzaczu
     thumb    – (opcjonalnie) ścieżka do miniatury, np. "img/glow-1.jpg"
     tone     – (opcjonalnie) numer 1–6, kolor tymczasowej miniatury gdy brak "thumb"

   Obsługiwane linki video:
     Instagram: https://www.instagram.com/reel/XXXX/
     TikTok:    https://www.tiktok.com/@nazwa/video/123456
     YouTube:   https://www.youtube.com/shorts/XXXX  lub  https://youtu.be/XXXX
   ===================================================================== */

const PORTFOLIO = [
  {
    name: 'Glow Studio',
    industry: 'Salon kosmetyczny',
    city: 'Warszawa',
    platforms: ['Instagram', 'TikTok'],
    period: '8 miesięcy współpracy',
    summary: 'Salon z pustymi terminami w tygodniu. Postawiliśmy na efekty przed / po i krótkie porady. Dziś kalendarz jest pełny z 2-tygodniowym wyprzedzeniem.',
    results: [
      { value: '2,4 mln', label: 'wyświetleń' },
      { value: '+11 200', label: 'obserwujących' },
      { value: '+280%', label: 'rezerwacji' }
    ],
    reels: [
      { title: 'Metamorfoza w 40 sekund', views: 486000, platform: 'Instagram', video: '', tone: 1 },
      { title: '3 błędy przy pielęgnacji', views: 213000, platform: 'TikTok', video: '', tone: 2 },
      { title: 'Dzień z życia salonu', views: 158000, platform: 'Instagram', video: '', tone: 3 }
    ]
  },
  {
    name: 'Smak Południa',
    industry: 'Restauracja',
    city: 'Kraków',
    platforms: ['Instagram', 'Facebook', 'TikTok'],
    period: '6 miesięcy współpracy',
    summary: 'Nowa restauracja bez rozpoznawalności. Kulisy kuchni, szef kuchni przed kamerą i lokalne hashtagi. Weekendy rezerwowane na tydzień do przodu.',
    results: [
      { value: '1,7 mln', label: 'wyświetleń' },
      { value: '+9 800', label: 'obserwujących' },
      { value: '+64%', label: 'rezerwacji weekendowych' }
    ],
    reels: [
      { title: 'Jak robimy pierogi od zera', views: 312000, platform: 'Instagram', video: '', tone: 4 },
      { title: 'Szef kuchni ocenia fast food', views: 540000, platform: 'TikTok', video: '', tone: 5 },
      { title: 'Nowe menu w 30 sekund', views: 97000, platform: 'Facebook', video: '', tone: 6 }
    ]
  },
  {
    name: 'TechSolve',
    industry: 'Usługi IT dla firm (B2B)',
    city: 'Wrocław',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    period: '12 miesięcy współpracy',
    summary: 'Ekspercka marka osobista prezesa. Krótkie video o błędach, które kosztują firmy pieniądze. Zapytania ofertowe trafiają prosto z komentarzy.',
    results: [
      { value: '3,1 mln', label: 'wyświetleń' },
      { value: '+38 400', label: 'obserwujących' },
      { value: '142', label: 'zapytań ofertowych' }
    ],
    reels: [
      { title: '3 błędy, które kosztują Cię klientów', views: 1100000, platform: 'TikTok', video: '', tone: 2 },
      { title: 'Ile kosztuje wyciek danych?', views: 420000, platform: 'YouTube', video: '', tone: 1 },
      { title: 'Audyt w 60 sekund', views: 188000, platform: 'Instagram', video: '', tone: 5 }
    ]
  },
  {
    name: 'FitZone',
    industry: 'Klub fitness',
    city: 'Gdańsk',
    platforms: ['Instagram', 'TikTok'],
    period: '5 miesięcy współpracy',
    summary: 'Klub konkurujący ceną z sieciówkami. Zamiast rabatów pokazaliśmy ludzi i atmosferę. Karnety sprzedają się bez promocji.',
    results: [
      { value: '1,3 mln', label: 'wyświetleń' },
      { value: '+6 100', label: 'obserwujących' },
      { value: '+92', label: 'nowych karnetów' }
    ],
    reels: [
      { title: 'Pierwszy dzień na siłowni', views: 367000, platform: 'TikTok', video: '', tone: 3 },
      { title: 'Trener odpowiada na hejt', views: 251000, platform: 'Instagram', video: '', tone: 6 },
      { title: 'Transformacja członka klubu', views: 143000, platform: 'Instagram', video: '', tone: 4 }
    ]
  }
];
