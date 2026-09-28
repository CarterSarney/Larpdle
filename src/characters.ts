export type Character = {
  id: string
  name: string
  age?: number | null
  image?: string | null
  gender: string
  affiliation: string[]
  devilFruit: string | null
  fruitType: string | null
  haki: string[]
  bounty: number | null
  height: number | null
  origin: string
  firstArc: string
}

export const characters: Character[] = [
  { id: 'luffy', name: 'Monkey D. Luffy', gender: 'Male', affiliation: ['Straw Hat Pirates', 'Four Emperors'], devilFruit: 'Gomu Gomu no Mi', fruitType: 'Mythical Zoan', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 3000000000, height: 174, origin: 'East Blue', firstArc: 'Romance Dawn' },
  { id: 'zoro', name: 'Roronoa Zoro', gender: 'Male', affiliation: ['Straw Hat Pirates'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament', "Conqueror's"], bounty: 1111000000, height: 181, origin: 'East Blue', firstArc: 'Romance Dawn' },
  { id: 'nami', name: 'Nami', gender: 'Female', affiliation: ['Straw Hat Pirates'], devilFruit: null, fruitType: null, haki: [], bounty: 366000000, height: 170, origin: 'East Blue', firstArc: 'Romance Dawn' },
  { id: 'usopp', name: 'Usopp', gender: 'Male', affiliation: ['Straw Hat Pirates'], devilFruit: null, fruitType: null, haki: ['Observation'], bounty: 500000000, height: 176, origin: 'East Blue', firstArc: 'Syrup Village' },
  { id: 'sanji', name: 'Vinsmoke Sanji', gender: 'Male', affiliation: ['Straw Hat Pirates', 'Germa Kingdom'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament'], bounty: 1032000000, height: 180, origin: 'North Blue', firstArc: 'Baratie' },
  { id: 'chopper', name: 'Tony Tony Chopper', gender: 'Male', affiliation: ['Straw Hat Pirates'], devilFruit: 'Hito Hito no Mi', fruitType: 'Zoan', haki: [], bounty: 1000, height: 90, origin: 'Grand Line', firstArc: 'Drum Island' },
  { id: 'robin', name: 'Nico Robin', gender: 'Female', affiliation: ['Straw Hat Pirates'], devilFruit: 'Hana Hana no Mi', fruitType: 'Paramecia', haki: [], bounty: 930000000, height: 188, origin: 'West Blue', firstArc: 'Whisky Peak' },
  { id: 'franky', name: 'Franky', gender: 'Male', affiliation: ['Straw Hat Pirates'], devilFruit: null, fruitType: null, haki: [], bounty: 394000000, height: 240, origin: 'South Blue', firstArc: 'Water 7' },
  { id: 'brook', name: 'Brook', gender: 'Male', affiliation: ['Straw Hat Pirates', 'Rumbar Pirates'], devilFruit: 'Yomi Yomi no Mi', fruitType: 'Paramecia', haki: [], bounty: 383000000, height: 277, origin: 'West Blue', firstArc: 'Thriller Bark' },
  { id: 'jinbe', name: 'Jinbe', gender: 'Male', affiliation: ['Straw Hat Pirates', 'Sun Pirates'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament'], bounty: 1100000000, height: 301, origin: 'Grand Line', firstArc: 'Impel Down' },
  { id: 'shanks', name: 'Shanks', gender: 'Male', affiliation: ['Red Hair Pirates', 'Four Emperors'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament', "Conqueror's"], bounty: 4048900000, height: 199, origin: 'West Blue', firstArc: 'Romance Dawn' },
  { id: 'buggy', name: 'Buggy', gender: 'Male', affiliation: ['Cross Guild', 'Four Emperors'], devilFruit: 'Bara Bara no Mi', fruitType: 'Paramecia', haki: [], bounty: 3189000000, height: 192, origin: 'Grand Line', firstArc: 'Orange Town' },
  { id: 'ace', name: 'Portgas D. Ace', gender: 'Male', affiliation: ['Whitebeard Pirates', 'Spade Pirates'], devilFruit: 'Mera Mera no Mi', fruitType: 'Logia', haki: ['Armament', "Conqueror's"], bounty: 550000000, height: 185, origin: 'South Blue', firstArc: 'Post-War' },
  { id: 'sabo', name: 'Sabo', gender: 'Male', affiliation: ['Revolutionary Army'], devilFruit: 'Mera Mera no Mi', fruitType: 'Logia', haki: ['Observation', 'Armament'], bounty: 602000000, height: 187, origin: 'East Blue', firstArc: 'Post-War' },
  { id: 'law', name: 'Trafalgar D. Water Law', gender: 'Male', affiliation: ['Heart Pirates'], devilFruit: 'Ope Ope no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament'], bounty: 3000000000, height: 191, origin: 'North Blue', firstArc: 'Sabaody Archipelago' },
  { id: 'kid', name: 'Eustass Kid', gender: 'Male', affiliation: ['Kid Pirates'], devilFruit: 'Jiki Jiki no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 3000000000, height: 205, origin: 'South Blue', firstArc: 'Sabaody Archipelago' },
  { id: 'boa', name: 'Boa Hancock', gender: 'Female', affiliation: ['Kuja Pirates'], devilFruit: 'Mero Mero no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 1659000000, height: 191, origin: 'Calm Belt', firstArc: 'Amazon Lily' },
  { id: 'crocodile', name: 'Crocodile', gender: 'Male', affiliation: ['Cross Guild', 'Baroque Works'], devilFruit: 'Suna Suna no Mi', fruitType: 'Logia', haki: [], bounty: 1965000000, height: 253, origin: 'Grand Line', firstArc: 'Whisky Peak' },
  { id: 'doflamingo', name: 'Donquixote Doflamingo', gender: 'Male', affiliation: ['Donquixote Pirates'], devilFruit: 'Ito Ito no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 340000000, height: 305, origin: 'North Blue', firstArc: 'Jaya' },
  { id: 'katakuri', name: 'Charlotte Katakuri', gender: 'Male', affiliation: ['Big Mom Pirates'], devilFruit: 'Mochi Mochi no Mi', fruitType: 'Special Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 1057000000, height: 509, origin: 'Grand Line', firstArc: 'Whole Cake Island' },
  { id: 'kaido', name: 'Kaido', gender: 'Male', affiliation: ['Beasts Pirates', 'Four Emperors'], devilFruit: 'Uo Uo no Mi, Model: Seiryu', fruitType: 'Mythical Zoan', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 4611100000, height: 710, origin: 'Grand Line', firstArc: 'Punk Hazard' },
  { id: 'big-mom', name: 'Charlotte Linlin', gender: 'Female', affiliation: ['Big Mom Pirates', 'Four Emperors'], devilFruit: 'Soru Soru no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 4388000000, height: 880, origin: 'Grand Line', firstArc: 'Whole Cake Island' },
  { id: 'mihawk', name: 'Dracule Mihawk', gender: 'Male', affiliation: ['Cross Guild'], devilFruit: null, fruitType: null, haki: [], bounty: 3590000000, height: 198, origin: 'East Blue', firstArc: 'Baratie' },
  { id: 'garp', name: 'Monkey D. Garp', gender: 'Male', affiliation: ['Marines'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament', "Conqueror's"], bounty: null, height: 287, origin: 'East Blue', firstArc: 'Post-Enies Lobby' },
  { id: 'koby', name: 'Koby', gender: 'Male', affiliation: ['Marines'], devilFruit: null, fruitType: null, haki: ['Observation'], bounty: 500000000, height: 167, origin: 'East Blue', firstArc: 'Romance Dawn' },
  { id: 'smoker', name: 'Smoker', gender: 'Male', affiliation: ['Marines'], devilFruit: 'Moku Moku no Mi', fruitType: 'Logia', haki: ['Observation', 'Armament'], bounty: null, height: 209, origin: 'Grand Line', firstArc: 'Loguetown' },
  { id: 'enel', name: 'Enel', gender: 'Male', affiliation: ['Gods Army'], devilFruit: 'Goro Goro no Mi', fruitType: 'Logia', haki: ['Observation'], bounty: null, height: 266, origin: 'Sky Islands', firstArc: 'Skypiea' },
  { id: 'vivi', name: 'Nefertari Vivi', gender: 'Female', affiliation: ['Alabasta Kingdom', 'Straw Hat Pirates'], devilFruit: null, fruitType: null, haki: [], bounty: 0, height: 169, origin: 'Grand Line', firstArc: 'Reverse Mountain' },
  { id: 'yamato', name: 'Yamato', gender: 'Female', affiliation: ['Beasts Pirates'], devilFruit: 'Inu Inu no Mi, Model: Okuchi no Makami', fruitType: 'Mythical Zoan', haki: ['Observation', 'Armament', "Conqueror's"], bounty: null, height: 263, origin: 'Grand Line', firstArc: 'Wano Country' },
  { id: 'bon-clay', name: 'Bentham (Bon Clay)', gender: 'Male', affiliation: ['Baroque Works', 'Newkama Land'], devilFruit: 'Mane Mane no Mi', fruitType: 'Paramecia', haki: [], bounty: 32000000, height: 238, origin: 'East Blue', firstArc: 'Little Garden' },
  { id: 'marco', name: 'Marco', gender: 'Male', affiliation: ['Whitebeard Pirates'], devilFruit: 'Tori Tori no Mi, Model: Phoenix', fruitType: 'Mythical Zoan', haki: ['Observation', 'Armament'], bounty: 1374000000, height: 203, origin: 'Grand Line', firstArc: 'Jaya' },
  { id: 'blackbeard', name: 'Marshall D. Teach', gender: 'Male', affiliation: ['Blackbeard Pirates', 'Four Emperors'], devilFruit: 'Yami Yami no Mi / Gura Gura no Mi', fruitType: 'Logia / Paramecia', haki: ['Observation', 'Armament'], bounty: 3996000000, height: 344, origin: 'Grand Line', firstArc: 'Jaya' },
  { id: 'roger', name: 'Gol D. Roger', gender: 'Male', affiliation: ['Roger Pirates'], devilFruit: null, fruitType: null, haki: ['Observation', 'Armament', "Conqueror's"], bounty: 5564800000, height: 274, origin: 'East Blue', firstArc: 'Romance Dawn' },
  { id: 'whitebeard', name: 'Edward Newgate', gender: 'Male', affiliation: ['Whitebeard Pirates'], devilFruit: 'Gura Gura no Mi', fruitType: 'Paramecia', haki: ['Observation', 'Armament', "Conqueror's"], bounty: 5046000000, height: 666, origin: 'Grand Line', firstArc: 'Jaya' },
]
