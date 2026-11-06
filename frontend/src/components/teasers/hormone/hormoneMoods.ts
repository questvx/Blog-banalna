import kociakImage from './images/niedzis.png'
import lokietkaImage from './images/lokiecka.png'
import krolowaSwiataImage from './images/krolowaswiata.png'
import placzkaImage from './images/placzka.png'
import zlosnicaImage from './images/zlosnica.png'

export type HormoneMoodSection = {
  heading?: string;
  paragraphs: string[];
}

export type HormoneMood = {
  id: string;
  name: string;
  shortDescription: string;
  sections: HormoneMoodSection[];
  image?: string;
}

export const hormoneMoods: HormoneMood[] = [
  {
    id: 'zlosnica',
    name: 'ZŁOŚNICA',
    shortDescription: 'Wszystko Cię dziś wkurza. Hałas jest za głośny, a cisza za cicha. A ludzie… no cóż, nie do wytrzymania.',
    image: zlosnicaImage,
    sections: [
      {
        paragraphs: [
          'Znamy to. Dzisiaj wszystko działa Ci na nerwy. Ludzie mówią za głośno, telefon dzwoni nie wtedy, kiedy powinien, a pytanie „co się stało?” zdecydowanie nie jest dziś pytaniem na miejscu.',
          'W dużej mierze mogą za tym stać hormony. W różnych momentach cyklu i życia ich poziom się zmienia, a wraz z nim może zmieniać się sposób, w jaki odbierasz rzeczywistość. To, co zwykle byłoby tylko drobną niedogodnością, nagle może wydać się przytłaczające, irytujące albo naprawdę trudne do zniesienia. Emocje stają się intensywniejsze, a cierpliwość szybciej się kończy. To nie znaczy, że przesadzasz — Twój organizm może sprawiać, że różne sytuacje odczuwasz mocniej.',
          'Twoja złość nie jest przez to mniej ważna ani mniej prawdziwa. Hormony mogą ją nasilać, ale nie muszą być jedynym powodem. Czasami organizm dokłada swoje trzy grosze, a czasami po prostu wydarzyło się za dużo.',
          'Nie musisz teraz udawać spokoju ani natychmiast wszystkiego naprawiać. Złość może być sygnałem, że potrzebujesz odpoczynku, granic, ciszy albo wsparcia. Jeśli możesz, daj sobie chwilę oddechu i trochę świętego spokoju. Odsuń się od tego, co dodatkowo Cię przeciąża, napij się ulubionej herbaty, odpocznij, przestań się spieszyć i poganiać samą siebie, nie myśl za dużo. Zrób to po to, żeby łagodniej przejść przez ten trudny moment.',
          'Jeśli dziś jesteś Złośnicą, Twoje emocje mają prawo się pojawić, ponieważ hormony sprawiają, że odczuwasz je mocniej niż zwykle.',
          'Masz prawo potrzebować czasu, zanim emocje opadną. Jutro może już nie będziesz Złośnicą — może będziesz się śmiać z samej siebie. Ciekawi mnie, jaka będziesz jutro. Może jutro będzie już łatwiej.',
        ],
      },
    ],
  },
  {
    id: 'lokietka',
    name: 'ŁOKIEĆKA',
    shortDescription: 'Najchętniej przytuliłabyś się do własnego łokcia i nie rozmawiała z nikim.',
    image: lokietkaImage,
    sections: [
      {
        paragraphs: [
          'Najchętniej przytuliłabyś się do własnego łokcia i nie rozmawiała z nikim.',
          'Tak mi dobrze. Wszystko robię spokojnie, powoli, delektując się każdą chwilą. Nie poganiam samej siebie. Idę na balkon podlać kwiatki. Idę do sklepu. Nie martwię się, że nie zdążę ugotować obiadu. Nieporządek w domu nie wywołuje we mnie żadnych emocji. Mogę po prostu usiąść, nie widzę bałaganu dookoła, nieporządek znikł z mojego pola widzenia, biorę książkę i odpoczywam.',
          'To jest ten dobry stan. Ciało wreszcie nie działa w trybie alarmowym. Oddech zwalnia, napięcie puszcza, a hormony stresu — kortyzol i adrenalina — przestają grać pierwsze skrzypce. Pojawia się więcej spokoju, a układ nerwowy może przełączyć się w tryb odpoczynku i regeneracji. To nie lenistwo. To chwila, w której nie musisz ze sobą walczyć.',
          'Czujesz się trochę jak na wakacjach, nawet jeśli wiesz, że praca to nie zając i nie ucieknie. I bardzo dobrze. Nie wszystko musi być zrobione natychmiast. Czasem największą troską o siebie jest pozwolić sobie niczego nie przyspieszać i przytulić samą siebie.',
        ],
      },
    ],
  },
  {
    id: 'krolowa-swiata',
    name: 'KRÓLOWA ŚWIATA',
    shortDescription: 'To dziś Ty. Masz energię, nowe pomysły wyskakują Ci z głowy jeden za drugim i jesteś przekonana, że dzisiaj naprawdę możesz to zrobić. Bo niby dlaczego nie?',
    image: krolowaSwiataImage,
    sections: [
      {
        paragraphs: [
          'To dziś Ty. Masz energię, nowe pomysły wyskakują Ci z głowy jeden za drugim i jesteś przekonana, że dzisiaj naprawdę możesz to zrobić. Bo niby dlaczego nie?',
          'Obudziłaś się wcześniej niż zwykle i czujesz się naprawdę wypoczęta. Patrzysz w lustro i pierwszy raz od dawna myślisz: całkiem dobrze wyglądam. Oczy radosne, buzia wypoczęta. Myśli też jakby lżejsze.',
          'Masz ochotę działać. Pomysły pojawiają się jeden za drugim i najchętniej od razu zabrałabyś się za ich realizację. Wszystko wydaje się prostsze niż zwykle. Patrzysz na świat optymistycznie, chce Ci się mówić, śmiać, nucić pod nosem. Włączasz ulubioną płytę i nagle postanawiasz przesłuchać ją całą, od początku do końca. Piszesz do koleżanki, z którą dawno nie rozmawiałaś. Po prostu chce Ci się być w środku tego wszystkiego.',
        ],
      },
      {
        heading: 'Co się dzieje?',
        paragraphs: [
          'Nie ma jednego „hormonu królowej świata”. Za taki stan odpowiada raczej kilka współpracujących ze sobą układów. Dopamina wiąże się z motywacją, ciekawością i chęcią działania, noradrenalina pomaga utrzymać czujność i energię, a rano do gry dołącza naturalny wzrost kortyzolu, który pomaga organizmowi się obudzić i wejść na obroty.',
          'A jeśli do tego dobrze spałaś, efekt może być naprawdę spektakularny.',
          'I właśnie dlatego czasem budzisz się i po prostu wiesz: dzisiaj mogę wszystko.',
        ],
      },
    ],
  },
  {
    id: 'placzka',
    name: 'PŁACZKA',
    shortDescription: 'Wzrusza Cię reklama jogurtu, a pytanie „co na obiad?” brzmi jak życiowy problem.',
    image: placzkaImage,
    sections: [
      {
        paragraphs: [
          'Wzrusza Cię reklama jogurtu, piosenka zasłyszana przypadkiem i widok drzewa poruszającego się na wietrze. A pytanie „co na obiad?” brzmi jak życiowy problem, którego naprawdę nie masz dziś siły rozwiązywać.',
          'Taka jest Płaczka. Od rana w głowie krążą myśli — nie te radosne i lekkie, tylko szare, ciężkie, prowadzące ścieżkami, na których trudno dostrzec drogę wyjścia. Myślisz monotonnie, wracasz do tych samych tematów i masz wrażenie, że wszystko Cię przygniata. Nic nie wydaje się proste, a wiele rzeczy nagle traci sens. Nawet jeśli obiektywnie nic wielkiego się nie wydarzyło, emocje potrafią urosnąć do rozmiaru prawdziwego dramatu.',
          'Masz szkliste oczy i łzy pojawiają się szybciej niż zwykle. Wzrusza Cię muzyka, film, przyroda, czyjaś historia, a czasem nawet zwykłe „jak się czujesz?”. Możesz mieć ochotę się wypłakać, przytulić albo po prostu pobyć sama. Nie dlatego, że przesadzasz. Po prostu wszystko dociera do Ciebie mocniej.',
        ],
      },
      {
        heading: 'Co się dzieje?',
        paragraphs: [
          'Za ten stan może odpowiadać kilka nakładających się czynników. Wahania hormonów płciowych, zwłaszcza estrogenu i progesteronu, mogą wpływać na układ nerwowy oraz na działanie serotoniny i innych neuroprzekaźników związanych z nastrojem. Dlatego łatwiej o rozdrażnienie, smutek, płaczliwość i poczucie przytłoczenia.',
          'Do tego dochodzi zmęczenie, gorszy sen, napięcie i mniejsza odporność psychiczna. Kiedy organizm ma mniej zasobów, emocje szybciej wychodzą na pierwszy plan. To, co zwykle byłoby tylko drobną niedogodnością, nagle może wydawać się ogromnym problemem.',
          'Płacz nie zawsze oznacza, że dzieje się coś złego. Czasem jest po prostu sposobem, w jaki ciało rozładowuje napięcie. Możesz więc pozwolić sobie na łzy, odpoczynek i odrobinę czułości dla samej siebie. Nie musisz dziś wszystkiego rozumieć ani nad wszystkim panować. Wystarczy, że przejdziesz przez ten dzień z wyrozumiałością dla siebie i świadomością, że hormony również mają wpływ na to, co czujesz.',
        ],
      },
    ],
  },
  {
    id: 'kociak',
    name: 'KOCIAK',
    shortDescription: 'Nic Ci się dziś nie chce… Tak bardzo nie chce… I właściwie nie widzisz żadnego powodu, żeby to zmieniać.',
    image: kociakImage,
    sections: [
      {
        paragraphs: [
          'Nic Ci się dziś nie chce… Tak bardzo nie chce… I właściwie nie widzisz żadnego powodu, żeby to zmieniać.',
          'I może to wcale nie jest zła wiadomość. Może właśnie dziś jest chwila na oddech. Nie masz ochoty nigdzie biec, niczego załatwiać, niczego nadrabiać. Chcesz po prostu poleżeć, posiedzieć, popatrzeć przez okno. I co najważniejsze — nie masz z tego powodu wyrzutów sumienia.',
          'To nie jest zmęczenie, które Cię przygniata. Bardziej coś w rodzaju ukojenia. Jesteś spokojna, trochę obojętna na to, co zwykle trzeba zrobić. Jakbyś na chwilę unosiła się nad tym wszystkim. Lekka. I może właśnie tego potrzebujesz.',
        ],
      },
      {
        heading: 'A co na to hormony?',
        paragraphs: [
          'Nie ma jednego hormonu odpowiedzialnego za „nic mi się nie chce”. W grę wchodzi między innymi dopamina, która uczestniczy w motywacji, zainteresowaniu i podejmowaniu działania. Kiedy jesteśmy niewyspani, przeciążeni albo po prostu potrzebujemy regeneracji, chęć do działania może wyraźnie spaść. Nie oznacza to jednak, że mamy po prostu „za mało dopaminy” — z samego samopoczucia nie da się określić jej poziomu.',
          'I może dobrze. Nie każdy dzień musi być dniem na podbijanie świata.',
          'Czasem „nie dziś” jest dokładnie tym, czego potrzebujesz dziś.',
        ],
      },
    ],
  },
]
