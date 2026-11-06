export type HormoneMood = {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export const hormoneMoods: HormoneMood[] = [
  {
    id: 'zlosnica',
    name: 'ZŁOŚNICA',
    description: 'Wszystko Cię dziś wkurza. Hałas jest za głośny, a cisza za cicha. A ludzie… no cóż, nie do wytrzymania.',
  },
  {
    id: 'lokiec-ka',
    name: 'ŁOKIEĆKA',
    description: 'Najchętniej przytuliłabyś się do własnego łokcia i nie rozmawiała z nikim.',
  },
  {
    id: 'krolowa-swiata',
    name: 'KRÓLOWA ŚWIATA',
    description: 'To dziś Ty. Masz energię, nowe pomysły wyskakują Ci z głowy jeden za drugim i jesteś przekonana, że dzisiaj naprawdę możesz to zrobić. Bo niby dlaczego nie?',
  },
  {
    id: 'placzka',
    name: 'PŁACZKA',
    description: 'Wzrusza Cię reklama jogurtu, a pytanie „co na obiad?” brzmi jak życiowy problem.',
  },
  {
    id: 'nie-dzis',
    name: 'NIE DZIŚ',
    description: 'Nic Ci się dziś nie chce… Tak bardzo nie chce… I właściwie nie widzisz żadnego powodu, żeby to zmieniać.',
  },
]
