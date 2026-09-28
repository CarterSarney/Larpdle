import type { Character } from './characters'

const archiveUrl = 'https://oparchive.com/data/characters.json'
const fruitUrl = 'https://oparchive.com/data/devil_fruits.json'
const featuredNames = ['Arlong', 'Kuro', 'Don Krieg', 'Hatchan', 'Alvida', 'Smoker', 'Tashigi', 'Crocodile', 'Enel', 'Rob Lucci', 'Kaku', 'Gecko Moria', 'Magellan', 'Hody Jones', 'Caesar Clown', 'Doflamingo', 'Katakuri', 'King', 'Queen', 'Jack', 'Yamato', 'King Neptune', 'Shirahoshi', 'Carrot', 'Pedro', 'Rebecca', 'Kyros', 'Bartolomeo', 'Cavendish', 'Bon Clay', 'Vivi', 'Ace', 'Sabo', 'Shanks', 'Blackbeard', 'Koby', 'Garp', 'Dragon', 'Akainu', 'Aokiji', 'Kizaru', 'Fujitora', 'Greenbull', 'Kuma', 'Ivankov', 'Rayleigh', 'Oden', 'Kinemon', 'Momonosuke', 'Tama', 'Big Mom', 'Kaido', 'King', 'Queen', 'Ulti', 'Page One', "Who's-Who", 'Sasaki', 'Black Maria', 'Marco', 'Jozu', 'Vista', 'Benn Beckman', 'Yasopp', 'Lucky Roux', 'Law', 'Kid', 'Killer', 'Bonney', 'Urouge', 'Apoo', 'Hawkins', 'Drake']
const arcStarts: Array<[number, string]> = [
  [1, 'Romance Dawn'], [8, 'Orange Town'], [22, 'Syrup Village'], [42, 'Baratie'], [69, 'Arlong Park'],
  [96, 'Loguetown'], [101, 'Reverse Mountain'], [106, 'Whisky Peak'], [115, 'Little Garden'], [130, 'Drum Island'],
  [155, 'Alabasta'], [218, 'Jaya'], [237, 'Skypiea'], [303, 'Long Ring Long Land'], [322, 'Water 7'],
  [375, 'Enies Lobby'], [442, 'Thriller Bark'], [490, 'Sabaody Archipelago'], [514, 'Amazon Lily'], [525, 'Impel Down'],
  [550, 'Marineford'], [581, 'Post-War'], [598, 'Return to Sabaody'], [603, 'Fish-Man Island'], [654, 'Punk Hazard'],
  [700, 'Dressrosa'], [802, 'Zou'], [825, 'Whole Cake Island'], [903, 'Reverie'], [909, 'Wano Country'],
  [1058, 'Egghead'], [1126, 'Elbaph'],
]

const femaleNames = new Set([
  'Aisa', 'Alvida', 'Amazon', 'Belo Betty', 'Boa Hancock', 'Boa Marigold', 'Boa Sandersonia', 'Charlotte Linlin [Big Mom]',
  'Charlotte Smoothie', 'Charlotte Pudding', 'Charlotte Brulee', 'Charlotte Flampe', 'Charlotte Galette', 'Charlotte Amande',
  'Charlotte Praline', 'Charlotte Chiffon', 'Charlotte Lola', 'Charlotte Poire', 'Charlotte Compote', 'Charlotte Anana',
  'Catarina Devon', 'Cindry', 'Conis', 'Dadan', 'Daisy', 'Désir', 'Doll', 'Edison', 'Gerd', 'Ginny', 'Gloriosa',
  'Hibari', 'Hina', 'Ikkaku', 'Inazuma', 'Jewelry Bonney', 'Kaya', 'Koala', 'Kujaku', 'Kureha', 'Kozuki Toki',
  'Lilith', 'Lily', 'Makino', 'Marguerite', 'Marianne [Miss Goldenweek]', 'Mikita [Miss Valentine]', 'Monet', 'Morley',
  'Nami', 'Nico Olvia', 'Nico Robin', 'Nojiko', 'Perona', 'Rebecca', 'Reiju', 'Rika', 'Sadi', 'Shakuyaku',
  'Shirahoshi', 'Stussy', 'Sugar', 'Tashigi', 'Tsuru', 'Ulti', 'Viola', 'Wanda', 'Whitey Bay', 'York', 'Zala [Miss Doublefinger]',
  'Yamato', 'Kiku', 'Kozuki Hiyori', 'Kozuki Oden’s wife', 'Charlotte Poire', 'Charlotte Citron', 'Charlotte Cinnamon',
])

const genderTerms = /\b(she|her|hers|woman|female|queen|princess|mother|daughter|sister)\b/i
const maleTerms = /\b(he|him|his|man|male|king|prince|father|son|brother)\b/i

export type DevilFruit = {
  id: string
  japaneseName: string
  englishName: string
  type: string
  user: string | null
  image: string | null
}

function canonical(value: string) {
  return value.replace(/\s*\[[^\]]*\]/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isMissing(value: unknown) {
  return value === null || value === undefined || (typeof value === 'string' && (!value.trim() || /^(unknown|n\/a)$/i.test(value.trim())))
}

function genderFor(name: string, description: string): string {
  if (femaleNames.has(name)) return 'Female'
  const normalizedName = canonical(name)
  if ([...femaleNames].some((knownName) => canonical(knownName) === normalizedName)) return 'Female'
  const saysFemale = genderTerms.test(description)
  const saysMale = maleTerms.test(description)
  if (saysFemale && !saysMale) return 'Female'
  if (saysMale && !saysFemale) return 'Male'
  return 'Male'
}

function arcFor(chapterText: string) {
  const chapter = Number(chapterText.match(/\d+/)?.[0])
  if (!Number.isFinite(chapter)) return chapterText
  let result = arcStarts[0][1]
  for (const [start, arc] of arcStarts) {
    if (chapter < start) break
    result = arc
  }
  return result
}

function normalizeFruitType(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('mythique') || normalized.includes('mythical')) return 'Mythical Zoan'
  if (normalized.includes('antique') || normalized.includes('ancient')) return 'Ancient Zoan'
  if (normalized.includes('zoan')) return 'Zoan'
  if (normalized.includes('param')) return normalized.includes('special') ? 'Special Paramecia' : 'Paramecia'
  if (normalized.includes('logia')) return 'Logia'
  return value
}

function fruitTypesFor(fruitName: string | null | undefined, fruits: Array<{ name: string; type: string }>): string | null {
  if (!fruitName) return null
  const fruitNames = fruitName.split(/\s*\/\s*/).map((value) => value.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase())
  const types = new Set<string>()
  for (const targetName of fruitNames) {
    const match = fruits.find((fruit) => fruit.name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase() === targetName)
    if (match?.type) types.add(normalizeFruitType(match.type))
  }
  return types.size ? [...types].join(' / ') : null
}

function characterId(name: string) {
  return `archive-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export async function loadDevilFruitRoster(): Promise<DevilFruit[]> {
  const response = await fetch(fruitUrl)
  if (!response.ok) throw new Error('Devil Fruit archive is unavailable')
  const records = await response.json() as Array<{ name?: string; english?: string; type?: string; user?: string; image?: string }>
  return records.flatMap((record): DevilFruit[] => {
    const japaneseName = record.name?.trim()
    if (!japaneseName) return []
    return [{
      id: `fruit-${japaneseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      japaneseName,
      englishName: record.english?.trim() || 'Unknown translation',
      type: record.type ? normalizeFruitType(record.type) : 'Unknown type',
      user: record.user?.trim() || null,
      image: record.image ? `https://oparchive.com${record.image}` : null,
    }]
  })
}

export async function loadArchiveRoster(baseRoster: Character[]): Promise<Character[]> {
  const [characterResponse, fruitResponse] = await Promise.all([fetch(archiveUrl), fetch(fruitUrl)])
  if (!characterResponse.ok || !fruitResponse.ok) throw new Error('Character archive is unavailable')
  const [records, fruits] = await Promise.all([
    characterResponse.json() as Promise<Array<Record<string, unknown>>>,
    fruitResponse.json() as Promise<Array<{ name: string; type: string }>>,
  ])

  const candidates = records.flatMap((record): Character[] => {
    const name = String(record.name ?? '').trim()
    if (!name) return []
    const fruitName = typeof record.devil_fruit === 'string' && record.devil_fruit.trim() ? record.devil_fruit.trim() : null
    const fruitType = fruitTypesFor(fruitName, fruits)
    const haki = Array.isArray(record.haki) ? record.haki.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())) : []
    const archiveTraits = [record.age, record.affiliation, record.bounty, record.height, record.origin, record.first_appearance_arc]
    const unknownTraits = archiveTraits.filter(isMissing).length + (fruitName && !fruitType ? 1 : 0) + (record.haki === null || record.haki === undefined ? 1 : 0)
    if (unknownTraits > 1) return []

    const firstArc = typeof record.first_appearance_arc === 'string' ? arcFor(record.first_appearance_arc) : 'Unknown'
    return [{
      id: characterId(name),
      name,
      age: typeof record.age === 'number' ? record.age : null,
      image: typeof record.image === 'string' ? `https://oparchive.com${record.image}` : null,
      gender: genderFor(name, typeof record.description === 'string' ? record.description : ''),
      affiliation: isMissing(record.affiliation) ? [] : [String(record.affiliation)],
      devilFruit: fruitName,
      fruitType,
      haki,
      bounty: typeof record.bounty === 'number' ? record.bounty : null,
      height: typeof record.height === 'number' ? record.height : null,
      origin: isMissing(record.origin) ? 'Unknown' : String(record.origin),
      firstArc,
    }]
  })

  const candidateByName = new Map(candidates.map((candidate) => [canonical(candidate.name), candidate]))
  const enrichedBase = baseRoster.map((character) => {
    const archiveMatch = candidateByName.get(canonical(character.name))
    const fallbackImage = `https://oparchive.com/images/characters/${character.name.replace(/\s+/g, '_')}.webp`
    return archiveMatch ? { ...character, age: archiveMatch.age, image: archiveMatch.image } : { ...character, image: character.image ?? fallbackImage }
  })
  const usedKeys = new Set(enrichedBase.map((character) => canonical(character.name)))
  const featured = new Set(featuredNames.map(canonical))
  const rankedCandidates = candidates.sort((left, right) => {
    const featuredDifference = Number(featured.has(canonical(right.name))) - Number(featured.has(canonical(left.name)))
    return featuredDifference || (right.bounty ?? -1) - (left.bounty ?? -1) || left.name.localeCompare(right.name)
  })
  const merged: Character[] = [...enrichedBase]
  for (const candidate of rankedCandidates) {
    const key = canonical(candidate.name)
    if (usedKeys.has(key)) continue
    usedKeys.add(key)
    merged.push(candidate)
    if (merged.length >= 200) break
  }
  return merged
}
