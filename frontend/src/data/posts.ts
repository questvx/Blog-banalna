export type Post = {
  id: number
  title: string
  excerpt: string
  content: string[]
  date: string
  category: string
  image: string
  featured?: boolean
}

export const posts: Post[] = [
  {
    id: 1,
    title: 'Jak odpoczywać, kiedy lista zadań nie ma końca?',
    excerpt: 'O odpoczynku bez poczucia winy, małych rytuałach i tym, że nicnierobienie też jest planem.',
    content: ['Odpoczynek nie musi być nagrodą za wykonanie wszystkich zadań. Czasem jest właśnie tym, co pozwala zobaczyć, które z nich naprawdę są ważne.', 'Lubię zaczynać od małego gestu: odkładam telefon, robię herbatę i przez kilka minut nie próbuję niczego naprawiać. To wystarcza, żeby dzień zwolnił.'],
    date: '2026-09-12',
    category: 'nowości',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85',
    featured: true,
  },
  {
    id: 2,
    title: 'Sobotni spacer, który zaczął się od kawy',
    excerpt: 'Nie trzeba wyjeżdżać daleko, żeby poczuć, że jest się gdzieś indziej.',
    content: ['Najlepsze sobotnie plany często zaczynają się bez planu. Wystarczy kawa wypita trochę wolniej niż zwykle i decyzja, żeby skręcić w nieznaną ulicę.', 'Po drodze znalazłam kilka spokojnych miejsc, do których chce się wracać.'],
    date: '2026-09-09',
    category: 'nowości',
    image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    title: 'Kuchnia bez pośpiechu: zupa na pierwszy chłód',
    excerpt: 'Najlepsze przepisy nie zaczynają się od perfekcyjnej listy zakupów.',
    content: ['Pierwszy chłód nie wymaga wielkich przygotowań. Wystarczy garnek, kilka warzyw i czas, żeby smaki spokojnie się połączyły.', 'Gotowanie bez pośpiechu przypomina, że dobry posiłek może być prostym sposobem na zaopiekowanie się sobą.'],
    date: '2026-09-04',
    category: 'kuchnia',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 4,
    title: 'Rzeczy, które zostają ze mną na dłużej',
    excerpt: 'Kilka drobiazgów, które sprawiają, że zwykły dzień ma trochę więcej sensu.',
    content: ['Niektóre przedmioty zostają z nami nie dlatego, że są wyjątkowe. Zostają, bo pamiętają konkretny dzień, osobę albo decyzję.', 'Lubię mieć wokół siebie rzeczy używane i lubiane, zamiast tych, które tylko czekają na odpowiednią okazję.'],
    date: '2026-08-28',
    category: 'inspiracje',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    title: 'O tym, dlaczego nie musimy być zawsze dostępne',
    excerpt: 'Czasem najczulszą odpowiedzią na świat jest wyciszenie telefonu.',
    content: ['Dostępność nie jest tym samym co obecność. Możemy odpowiadać później i nadal być blisko ważnych osób.', 'Wyciszenie telefonu nie rozwiązuje wszystkiego, ale daje przestrzeń, żeby usłyszeć własne myśli.'],
    date: '2026-08-21',
    category: 'filmy',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85',
  }
]