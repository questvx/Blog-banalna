export type Post = {
  id: number
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  image: string
  featured?: boolean
}

export const posts: Post[] = [
  {
    id: 1,
    title: 'Jak odpoczywać, kiedy lista zadań nie ma końca?',
    excerpt: 'O odpoczynku bez poczucia winy, małych rytuałach i tym, że nicnierobienie też jest planem.',
    date: '12 września 2026',
    category: 'głowa',
    readTime: '6 min czytania',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85',
    featured: true,
  },
  {
    id: 2,
    title: 'Sobotni spacer, który zaczął się od kawy',
    excerpt: 'Nie trzeba wyjeżdżać daleko, żeby poczuć, że jest się gdzieś indziej.',
    date: '9 września 2026',
    category: 'po swojemu',
    readTime: '4 min czytania',
    image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    title: 'Kuchnia bez pośpiechu: zupa na pierwszy chłód',
    excerpt: 'Najlepsze przepisy nie zaczynają się od perfekcyjnej listy zakupów.',
    date: '4 września 2026',
    category: 'stół',
    readTime: '5 min czytania',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 4,
    title: 'Rzeczy, które zostają ze mną na dłużej',
    excerpt: 'Kilka drobiazgów, które sprawiają, że zwykły dzień ma trochę więcej sensu.',
    date: '28 sierpnia 2026',
    category: 'rzeczy',
    readTime: '7 min czytania',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    title: 'O tym, dlaczego nie musimy być zawsze dostępne',
    excerpt: 'Czasem najczulszą odpowiedzią na świat jest wyciszenie telefonu.',
    date: '21 sierpnia 2026',
    category: 'głowa',
    readTime: '5 min czytania',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85',
  },
   {
    id: 6,
    title: 'O wszystkim i niczym: małe rytuały na dobry dzień',
    excerpt: 'Czasem najczulszą odpowiedzią na świat jest wyciszenie telefonu.',
    date: '25 sierpnia 2026',
    category: 'głowa',
    readTime: '5 min czytania',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85',
  },
    {
    id: 7,
    title: 'Kuchnia bez pośpiechu: zupa na pierwszy chłód',
    excerpt: 'Najlepsze przepisy nie zaczynają się od perfekcyjnej listy zakupów.',
    date: '4 września 2026',
    category: 'stół',
    readTime: '5 min czytania',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 8,
    title: 'Rzeczy, które zostają ze mną na dłużej',
    excerpt: 'Kilka drobiazgów, które sprawiają, że zwykły dzień ma trochę więcej sensu.',
    date: '28 sierpnia 2026',
    category: 'rzeczy',
    readTime: '7 min czytania',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85',
  },
]