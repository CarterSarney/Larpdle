import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { characters, type Character } from './characters'
import { loadArchiveRoster, loadDevilFruitRoster, type DevilFruit } from './archiveRoster'
import './App.css'

const columns = ['Character', 'Gender', 'Affiliation', 'Devil Fruit', 'Haki', 'Last Bounty', 'Height', 'Age', 'Origin', 'First Arc'] as const
const STORAGE_KEY = 'grand-line-daily-v3'
const FRUIT_STORAGE_KEY = 'grand-line-fruit-daily-v2'
const WANTED_STORAGE_KEY = 'grand-line-wanted-daily-v1'
const THEME_KEY = 'grand-line-theme'
const ROSTER_KEY = 'grand-line-roster-v2'
const FRUIT_ROSTER_KEY = 'grand-line-fruit-roster-v1'
const arcs = ['Romance Dawn', 'Orange Town', 'Syrup Village', 'Baratie', 'Arlong Park', 'Loguetown', 'Reverse Mountain', 'Whisky Peak', 'Little Garden', 'Drum Island', 'Alabasta', 'Jaya', 'Skypiea', 'Long Ring Long Land', 'Water 7', 'Enies Lobby', 'Thriller Bark', 'Sabaody Archipelago', 'Amazon Lily', 'Impel Down', 'Marineford', 'Post-War', 'Return to Sabaody', 'Fish-Man Island', 'Punk Hazard', 'Dressrosa', 'Zou', 'Whole Cake Island', 'Reverie', 'Wano Country', 'Egghead', 'Elbaph']

function dailyIndex<T extends { id: string }>(roster: T[], offset = 0) {
  const today = new Date()
  const dayNumber = Math.floor(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 86_400_000)
  return (dayNumber + offset) % roster.length
}

function nextDailyReset(now: Date) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
}

function countdownText(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function readSavedGuesses(roster: Character[] = characters, offset = 0, key = STORAGE_KEY): string[] {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return []
    const parsed = JSON.parse(saved) as { day: number; guesses: string[] }
    return parsed.day === dailyIndex(roster, offset) && Array.isArray(parsed.guesses) ? parsed.guesses : []
  } catch {
    return []
  }
}

function readCachedRoster() {
  try {
    const cachedRoster = JSON.parse(localStorage.getItem(ROSTER_KEY) ?? 'null') as Character[] | null
    return cachedRoster && cachedRoster.length >= 200 ? cachedRoster : characters
  } catch {
    return characters
  }
}

function readCachedFruits(): DevilFruit[] {
  try {
    const cached = JSON.parse(localStorage.getItem(FRUIT_ROSTER_KEY) ?? 'null') as DevilFruit[] | null
    return cached?.length ? cached : []
  } catch {
    return []
  }
}

function characterKey(name: string) {
  return name.replace(/\s*\[[^\]]*\]/g, '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function fruitUserCharacter(fruit: DevilFruit, roster: Character[]) {
  if (!fruit.user) return undefined
  const userKey = characterKey(fruit.user)
  const aliases: Record<string, string> = {
    blackbeard: 'marshall d teach',
    doflamingo: 'donquixote doflamingo',
    kaidou: 'kaido',
    aokiji: 'kuzan',
    akainu: 'sakazuki',
    kizaru: 'borsalino',
    fujitora: 'issho',
    ryokugyu: 'aramaki',
  }
  const lookupKey = characterKey(aliases[userKey] ?? fruit.user)
  return roster.find((character) => characterKey(character.name) === lookupKey)
}

function fruitPuzzlePool(fruits: DevilFruit[], roster: Character[]) {
  return fruits.filter((fruit) => fruitUserCharacter(fruit, roster))
}

function readSavedFruitGuesses(roster: Character[]) {
  return readSavedGuesses(roster, 2, FRUIT_STORAGE_KEY)
}

function readSavedWantedGuesses(roster: Character[]) {
  return readSavedGuesses(roster, 1, WANTED_STORAGE_KEY)
}

function listValue(value: string[]) {
  return value.length ? value.join(', ') : 'None known'
}

function bountyValue(value: number | null) {
  if (value === null) return 'Unknown'
  if (value === 0) return 'No bounty'
  return `${new Intl.NumberFormat('en-US').format(value)} B`
}

function heightValue(value: number | null) {
  return value === null ? 'Unknown' : `${value} cm`
}

function ageValue(value?: number | null) {
  return value == null ? 'Unknown' : `${value}`
}

function arcRank(value: string) {
  if (value.startsWith('Chapter ')) return Number(value.slice(8))
  return arcs.indexOf(value)
}

function overlaps(left: string[], right: string[]) {
  return left.some((item) => right.includes(item))
}

type CellResult = { text: string; state: 'correct' | 'partial' | 'wrong' | 'higher' | 'lower' }

function compare(guess: Character, answer: Character): CellResult[] {
  const cells: CellResult[] = [
    { text: guess.name, state: guess.id === answer.id ? 'correct' : 'wrong' },
    { text: guess.gender, state: guess.gender === answer.gender ? 'correct' : 'wrong' },
    {
      text: listValue(guess.affiliation),
      state: guess.affiliation.join('|') === answer.affiliation.join('|') ? 'correct' : overlaps(guess.affiliation, answer.affiliation) ? 'partial' : 'wrong',
    },
    {
      text: guess.fruitType ?? 'None known',
      state: guess.fruitType === answer.fruitType ? 'correct' : 'wrong',
    },
    {
      text: listValue(guess.haki),
      state: guess.haki.join('|') === answer.haki.join('|') ? 'correct' : overlaps(guess.haki, answer.haki) ? 'partial' : 'wrong',
    },
    {
      text: bountyValue(guess.bounty),
      state: guess.bounty === answer.bounty ? 'correct' : guess.bounty !== null && answer.bounty !== null && Math.max(guess.bounty, answer.bounty) <= Math.min(guess.bounty, answer.bounty) * 2 ? 'partial' : guess.bounty === null || answer.bounty === null ? 'wrong' : guess.bounty < answer.bounty ? 'higher' : 'lower',
    },
    {
      text: heightValue(guess.height),
      state: guess.height === answer.height ? 'correct' : guess.height !== null && answer.height !== null && Math.abs(guess.height - answer.height) <= 10 ? 'partial' : guess.height === null || answer.height === null ? 'wrong' : guess.height < answer.height ? 'higher' : 'lower',
    },
    {
      text: ageValue(guess.age),
      state: guess.age === answer.age ? 'correct' : guess.age == null || answer.age == null ? 'wrong' : guess.age < answer.age ? 'higher' : 'lower',
    },
    { text: guess.origin, state: guess.origin === answer.origin ? 'correct' : 'wrong' },
    {
      text: guess.firstArc,
      state: guess.firstArc === answer.firstArc ? 'correct' : arcRank(guess.firstArc) < 0 || arcRank(answer.firstArc) < 0 ? 'wrong' : arcRank(guess.firstArc) < arcRank(answer.firstArc) ? 'higher' : 'lower',
    },
  ]
  return cells.map((cell) => ({
    ...cell,
    text: cell.state === 'higher' ? `${cell.text} · higher` : cell.state === 'lower' ? `${cell.text} · lower` : cell.text,
  }))
}

function App() {
  const [roster, setRoster] = useState<Character[]>(readCachedRoster)
  const [fruits, setFruits] = useState<DevilFruit[]>(readCachedFruits)
  const [gameMode, setGameMode] = useState<'classic' | 'japanese-fruit' | 'wanted'>('classic')
  const [mode, setMode] = useState<'daily' | 'unlimited'>('daily')
  const modeRef = useRef(mode)
  const rosterRef = useRef(roster)
  const fruitsRef = useRef(fruits)
  const [answerId, setAnswerId] = useState(roster[dailyIndex(roster)].id)
  const [guesses, setGuesses] = useState<string[]>(() => readSavedGuesses(roster))
  const [posterAnswerId, setPosterAnswerId] = useState(roster[dailyIndex(roster, 1)].id)
  const [posterGuesses, setPosterGuesses] = useState<string[]>(() => readSavedWantedGuesses(roster))
  const [fruitAnswerId, setFruitAnswerId] = useState(() => {
    const cachedRoster = readCachedRoster()
    const cachedFruits = readCachedFruits()
    const pool = fruitPuzzlePool(cachedFruits, cachedRoster)
    return pool.length ? pool[dailyIndex(pool, 2)].id : ''
  })
  const [fruitGuesses, setFruitGuesses] = useState<string[]>(() => readSavedFruitGuesses(readCachedRoster()))
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light')
  const [now, setNow] = useState(() => new Date())
  const [query, setQuery] = useState('')
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [message, setMessage] = useState('')
  const [showRoster, setShowRoster] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)
  const [dismissWin, setDismissWin] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`
  const dayKeyRef = useRef(dayKey)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date()
      const currentDayKey = `${current.getUTCFullYear()}-${current.getUTCMonth()}-${current.getUTCDate()}`
      setNow(current)
      if (currentDayKey !== dayKeyRef.current && modeRef.current === 'daily') {
        const currentRoster = rosterRef.current
        setAnswerId(currentRoster[dailyIndex(currentRoster)].id)
        setGuesses(readSavedGuesses(currentRoster))
        setPosterAnswerId(currentRoster[dailyIndex(currentRoster, 1)].id)
        setPosterGuesses(readSavedWantedGuesses(currentRoster))
        const currentFruits = fruitsRef.current
        const fruitPool = fruitPuzzlePool(currentFruits, currentRoster)
        if (fruitPool.length) {
          setFruitAnswerId(fruitPool[dailyIndex(fruitPool, 2)].id)
          setFruitGuesses(readSavedFruitGuesses(currentRoster))
        }
        setGaveUp(false)
        setDismissWin(false)
      }
      dayKeyRef.current = currentDayKey
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    modeRef.current = mode
    rosterRef.current = roster
    fruitsRef.current = fruits
  }, [mode, roster, fruits])

  useEffect(() => {
    let active = true
    Promise.all([loadArchiveRoster(characters), loadDevilFruitRoster()]).then(([loadedRoster, loadedFruits]) => {
      if (!active) return
      setRoster(loadedRoster)
      setAnswerId(loadedRoster[dailyIndex(loadedRoster)].id)
      setGuesses(readSavedGuesses(loadedRoster))
      setPosterAnswerId(loadedRoster[dailyIndex(loadedRoster, 1)].id)
      setPosterGuesses(readSavedWantedGuesses(loadedRoster))
      setFruits(loadedFruits)
      const fruitPool = fruitPuzzlePool(loadedFruits, loadedRoster)
      if (fruitPool.length) setFruitAnswerId(fruitPool[dailyIndex(fruitPool, 2)].id)
      setFruitGuesses(readSavedFruitGuesses(loadedRoster))
      localStorage.setItem(ROSTER_KEY, JSON.stringify(loadedRoster))
      localStorage.setItem(FRUIT_ROSTER_KEY, JSON.stringify(loadedFruits))
    }).catch(() => {
      if (active) console.warn('Using the curated character roster because OPArchive could not be reached.')
    })
    return () => { active = false }
  }, [])

  const answer = roster.find((character) => character.id === answerId) ?? roster[dailyIndex(roster)]
  const wantedAnswer = roster.find((character) => character.id === posterAnswerId) ?? roster[dailyIndex(roster, 1)]
  const fruitPool = fruitPuzzlePool(fruits, roster)
  const fruitAnswer = fruitPool.find((fruit) => fruit.id === fruitAnswerId) ?? fruitPool[dailyIndex(fruitPool, 2)]
  const fruitUserAnswer = fruitAnswer ? fruitUserCharacter(fruitAnswer, roster) : undefined
  const activeAnswer = gameMode === 'japanese-fruit' ? fruitUserAnswer : gameMode === 'wanted' ? wantedAnswer : answer
  const activeGuessIds = gameMode === 'japanese-fruit' ? fruitGuesses : gameMode === 'wanted' ? posterGuesses : guesses
  const guessedCharacters = useMemo(
    () => activeGuessIds.map((id) => roster.find((character) => character.id === id)).filter((character): character is Character => Boolean(character)),
    [activeGuessIds, roster],
  )
  const characterSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return roster.filter((character) => character.name.toLowerCase().includes(normalized) && !activeGuessIds.includes(character.id)).slice(0, 7)
  }, [query, activeGuessIds, roster])
  const suggestions = characterSuggestions.map((character) => ({
    id: character.id,
    name: character.name,
    detail: gameMode === 'japanese-fruit' ? '' : character.affiliation[0] ?? 'Independent',
    image: gameMode === 'japanese-fruit' ? null : character.image,
  }))
  const activeGuessCount = activeGuessIds.length
  const solved = Boolean(activeAnswer && activeGuessIds.includes(activeAnswer.id))
  const finished = solved || gaveUp
  const allDailyModesSolved = mode === 'daily'
    && guesses.includes(answer.id)
    && posterGuesses.includes(wantedAnswer.id)
    && Boolean(fruitUserAnswer && fruitGuesses.includes(fruitUserAnswer.id))

  async function shareDailyResults() {
    const shareUrl = `${window.location.origin}${window.location.pathname}`
    const shareText = [
      '🏴‍☠️ Grand Line Guess · Daily Logbook',
      `🧭 Classic: ${guesses.length} guesses`,
      `🍈 Devil Fruit: ${fruitGuesses.length} guesses`,
      `📜 Wanted Poster: ${posterGuesses.length} guesses`,
      `🌊 ${shareUrl}`,
    ].join('\n') 

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Grand Line Guess', text: shareText, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareText)
        setMessage('Daily results copied. Share them with your crew!')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setMessage('Could not share automatically. Try copying the page link from your browser.')
    }
  }

  function chooseMode(nextMode: 'daily' | 'unlimited') {
    setMode(nextMode)
    setGuesses(nextMode === 'daily' ? readSavedGuesses(roster) : [])
    setAnswerId(nextMode === 'daily' ? roster[dailyIndex(roster)].id : roster[Math.floor(Math.random() * roster.length)].id)
    setPosterGuesses(nextMode === 'daily' ? readSavedWantedGuesses(roster) : [])
    setPosterAnswerId(nextMode === 'daily' ? roster[dailyIndex(roster, 1)].id : roster[Math.floor(Math.random() * roster.length)].id)
    setFruitGuesses(nextMode === 'daily' ? readSavedFruitGuesses(roster) : [])
    if (fruitPool.length) setFruitAnswerId(nextMode === 'daily' ? fruitPool[dailyIndex(fruitPool, 2)].id : fruitPool[Math.floor(Math.random() * fruitPool.length)].id)
    setGaveUp(false)
    setQuery('')
    setActiveSuggestion(-1)
    setMessage('')
  }

  function chooseGameMode(nextMode: 'classic' | 'japanese-fruit' | 'wanted') {
    setGameMode(nextMode)
    setGaveUp(false)
    setQuery('')
    setActiveSuggestion(-1)
    setMessage('')
    if (nextMode === 'classic') {
      setGuesses(mode === 'daily' ? readSavedGuesses(roster) : [])
      setAnswerId(mode === 'daily' ? roster[dailyIndex(roster)].id : roster[Math.floor(Math.random() * roster.length)].id)
    } else if (nextMode === 'wanted') {
      setPosterGuesses(mode === 'daily' ? readSavedWantedGuesses(roster) : [])
      setPosterAnswerId(mode === 'daily' ? roster[dailyIndex(roster, 1)].id : roster[Math.floor(Math.random() * roster.length)].id)
    } else {
      setFruitGuesses(mode === 'daily' ? readSavedFruitGuesses(roster) : [])
      if (fruitPool.length) setFruitAnswerId(mode === 'daily' ? fruitPool[dailyIndex(fruitPool, 2)].id : fruitPool[Math.floor(Math.random() * fruitPool.length)].id)
    }
  }

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem(THEME_KEY, nextTheme)
  }

  function submitGuess(name = query) {
    const normalizedName = name.trim().toLowerCase()
    const character = roster.find((item) => item.name.toLowerCase() === normalizedName)
    if (!character) {
      setMessage('Choose a name from the roster.')
      return
    }
    if (activeGuessIds.includes(character.id)) {
      setMessage('You already tried that character.')
      return
    }
    const nextGuesses = [...activeGuessIds, character.id]
    if (gameMode === 'japanese-fruit') setFruitGuesses(nextGuesses)
    else if (gameMode === 'wanted') setPosterGuesses(nextGuesses)
    else setGuesses(nextGuesses)
    if (activeAnswer && character.id === activeAnswer.id) setDismissWin(false)
    if (mode === 'daily') {
      const dayOffset = gameMode === 'wanted' ? 1 : gameMode === 'japanese-fruit' ? 2 : 0
      const storageKey = gameMode === 'wanted' ? WANTED_STORAGE_KEY : gameMode === 'japanese-fruit' ? FRUIT_STORAGE_KEY : STORAGE_KEY
      localStorage.setItem(storageKey, JSON.stringify({ day: dailyIndex(roster, dayOffset), guesses: nextGuesses }))
    }
    setQuery('')
    setActiveSuggestion(-1)
    setMessage('')
    requestAnimationFrame(() => searchInput.current?.focus())
  }

  function resetGame(nextRound = false) {
    if (mode === 'unlimited' && nextRound) {
      if (gameMode === 'japanese-fruit' && fruitPool.length > 1) {
        const availableFruits = fruitPool.filter((fruit) => fruit.id !== fruitAnswer?.id)
        setFruitAnswerId(availableFruits[Math.floor(Math.random() * availableFruits.length)].id)
      } else if (gameMode === 'wanted') {
        const availableCharacters = roster.filter((character) => character.id !== wantedAnswer.id)
        setPosterAnswerId(availableCharacters[Math.floor(Math.random() * availableCharacters.length)].id)
      } else {
        const availableCharacters = roster.filter((character) => character.id !== answer.id)
        setAnswerId(availableCharacters[Math.floor(Math.random() * availableCharacters.length)].id)
      }
    }
    if (gameMode === 'japanese-fruit') setFruitGuesses([])
    else if (gameMode === 'wanted') setPosterGuesses([])
    else setGuesses([])
    setQuery('')
    setMessage('')
    setGaveUp(false)
    setDismissWin(false)
    if (mode === 'daily') {
      const storageKey = gameMode === 'wanted' ? WANTED_STORAGE_KEY : gameMode === 'japanese-fruit' ? FRUIT_STORAGE_KEY : STORAGE_KEY
      localStorage.removeItem(storageKey)
    }
  }

  function giveUp() {
    setGaveUp(true)
    setQuery('')
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setActiveSuggestion((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setActiveSuggestion((current) => current <= 0 ? suggestions.length - 1 : current - 1)
    } else if (event.key === 'Enter') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        event.preventDefault()
        submitGuess(suggestions[activeSuggestion].name)
      } else if (suggestions.length > 0) {
        const exactMatch = suggestions.find((suggestion) => suggestion.name.toLowerCase() === query.trim().toLowerCase())
        if (exactMatch) {
          event.preventDefault()
          submitGuess(exactMatch.name)
        } else {
          event.preventDefault()
          setMessage('Use the arrow keys to choose a result, or type the full name.')
        }
      }
    } else if (event.key === 'Escape') {
      setQuery('')
      setActiveSuggestion(-1)
    }
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Grand Line Guess home"><span className="mark">GL</span><span>GRAND LINE <b>GUESS</b></span></a>
        <div className="topbar-right"><span className="edition"><span className="live-dot" /> {mode === 'daily' ? 'DAILY DISPATCH' : 'OPEN WATERS'}</span>{mode === 'daily' && <span className="countdown"><small>NEXT PUZZLE</small><b>{countdownText(nextDailyReset(now) - now.getTime())}</b></span>}<button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾' : '☀'}</button><span className="date-stamp">{new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', timeZone: 'UTC' }).format(now)}</span></div>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-copy">
            <h1>Grand Line Guess</h1>
            <p className="deck">You want my character, you can guess it</p>
          </div>
        </section>

        <section className="game-area" aria-label={gameMode === 'japanese-fruit' ? 'Japanese Devil Fruit puzzle' : gameMode === 'wanted' ? 'Wanted poster puzzle' : 'Daily character puzzle'}>
          <div className="game-toolbar">
            <div className="toolbar-line" />
            <div className="mode-picker" role="group" aria-label="Game mode"><button className={mode === 'daily' ? 'selected' : ''} onClick={() => chooseMode('daily')}>DAILY</button><button className={mode === 'unlimited' ? 'selected' : ''} onClick={() => chooseMode('unlimited')}>UNLIMITED</button></div>
            {gameMode !== 'japanese-fruit' && <button className="text-button roster-toggle" onClick={() => setShowRoster((visible) => !visible)} aria-expanded={showRoster}>{showRoster ? 'Hide roster' : `Browse roster · ${roster.length}`}</button>}
          </div>

          <div className="game-type-picker" role="group" aria-label="Puzzle type">
            <button className={gameMode === 'classic' ? 'selected' : ''} aria-pressed={gameMode === 'classic'} onClick={() => chooseGameMode('classic')}>CLASSIC</button>
            <button className={gameMode === 'japanese-fruit' ? 'selected' : ''} aria-pressed={gameMode === 'japanese-fruit'} onClick={() => chooseGameMode('japanese-fruit')}>DEVIL FRUIT <span>日本語</span></button>
            <button className={gameMode === 'wanted' ? 'selected' : ''} aria-pressed={gameMode === 'wanted'} onClick={() => chooseGameMode('wanted')}>WANTED POSTER</button>
          </div>

          {allDailyModesSolved && <section className="daily-share" aria-label="Share daily results">
            <div><strong>🏴‍☠️ The whole logbook is complete!</strong><span>Your crew deserves to see this run.</span></div>
            <button onClick={shareDailyResults}>Share results <span aria-hidden="true">↗</span></button>
          </section>}

          {gameMode === 'japanese-fruit' && <div className="fruit-clue" aria-label="Japanese Devil Fruit clue">
            <span>WHO ATE THIS DEVIL FRUIT?</span>
            <strong lang="ja-Latn">{fruitAnswer?.japaneseName ?? 'Loading fruit clue...'}</strong>
          </div>}

          {gameMode === 'wanted' && !finished && <div className="wanted-card" aria-label="Mystery wanted poster">
            <div className="wanted-copy"><span>MARINE NOTICE</span><strong>WANTED</strong><b>DEAD OR ALIVE</b><small>IDENTIFY THIS PIRATE</small></div>
            <img src={wantedAnswer.image ?? ''} alt="Mystery character wanted poster" onError={(event) => { event.currentTarget.hidden = true }} />
            <div className="wanted-bounty"><span>BOUNTY</span><b>{bountyValue(wantedAnswer.bounty)}</b></div>
          </div>}

          {!finished ? (
            <form className="guess-form" onSubmit={(event) => { event.preventDefault(); submitGuess() }}>
              <label className="sr-only" htmlFor="character-search">Search the character roster</label>
              <div className="search-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input ref={searchInput} id="character-search" autoComplete="off" placeholder={gameMode === 'japanese-fruit' ? 'Guess the character who ate it...' : gameMode === 'wanted' ? 'Who is on this wanted poster?' : 'Type a character name...'} value={query} aria-expanded={Boolean(query && suggestions.length)} aria-controls="character-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `character-option-${suggestions[activeSuggestion]?.id}` : undefined} onKeyDown={handleSearchKeyDown} onChange={(event) => { setQuery(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setMessage('')} />
                {query && <div className="suggestions" id="character-suggestions" role="listbox" aria-label="Matching characters">
                  {suggestions.length ? suggestions.map((suggestion, index) => <button type="button" role="option" id={`character-option-${suggestion.id}`} aria-selected={index === activeSuggestion} className={index === activeSuggestion ? 'active' : ''} key={suggestion.id} onMouseDown={(event) => event.preventDefault()} onClick={() => submitGuess(suggestion.name)}><span className="suggestion-character">{suggestion.image && <img src={suggestion.image} alt="" onError={(event) => { event.currentTarget.hidden = true }} />}<span>{suggestion.name}</span></span>{suggestion.detail && <small>{suggestion.detail}</small>}</button>) : <p>No matching character in this roster.</p>}
                </div>}
              </div>
              <button className="guess-button" type="submit">GUESS <span>↗</span></button>
            </form>
          ) : (
            <div className={`result-banner ${solved ? 'win' : 'miss'}`} role="status"><div><strong>{solved ? 'You found them.' : gaveUp ? 'You gave up.' : 'The trail went cold.'}</strong><span>The character was {activeAnswer?.name ?? 'unknown'}.</span></div><button className="text-button" onClick={() => mode === 'unlimited' ? resetGame(true) : chooseMode('unlimited')}>Play again ↗</button></div>
          )}
          {mode === 'daily' && !finished && activeGuessCount >= 10 && <button className="give-up-button" onClick={giveUp}>Give up and reveal answer</button>}
          {message && <p className="form-message" role="status">{message}</p>}

          {showRoster && <div className="roster-panel"><div className="roster-heading"><span>AVAILABLE CHARACTERS</span><small>Search above to make a guess</small></div><div className="roster-list">{roster.map((character) => <span key={character.id} className={activeGuessIds.includes(character.id) ? 'roster-used' : ''}>{character.name}</span>)}</div></div>}

          <div className="board-scroll">
            {gameMode === 'classic' ? <div className="board" role="table" aria-label="Guess comparisons">
              <div className="board-head" role="row">{columns.map((column, index) => <div className={`column-heading heading-${index}`} role="columnheader" key={column}>{column}</div>)}</div>
              <div className="guess-list">
                {guessedCharacters.map((character, index) => <div className="guess-row" role="row" key={character.id}>
                  {activeAnswer && compare(character, activeAnswer).map((cell, cellIndex) => <div className={`guess-cell ${cell.state} ${cellIndex === 0 ? 'character-cell' : ''}`} role="cell" key={`${character.id}-${columns[cellIndex]}`} title={`${columns[cellIndex]}: ${cell.text}`} style={{ animationDelay: `${cellIndex * 85}ms` }}>
                    {cellIndex === 0 ? <span className="guess-character"><span className="cell-index">{String(index + 1).padStart(2, '0')}</span><img src={character.image ?? ''} alt="" onError={(event) => { event.currentTarget.hidden = true }} /><span>{cell.text}</span></span> : <span>{cell.text}</span>}
                  </div>)}
                </div>)}
                {guessedCharacters.length === 0 && <div className="empty-state"><span className="compass">✳</span><p>The logbook is blank.</p><small>Make your first guess to reveal the clues.</small></div>}
              </div>
            </div> : <div className="name-only-board" role="list" aria-label="Character guesses">
              {guessedCharacters.map((character, index) => <div className={`name-only-row ${character.id === activeAnswer?.id ? 'correct' : 'wrong'}`} role="listitem" key={character.id} style={{ animationDelay: `${index * 75}ms` }}>
                <span>{character.name}</span>
              </div>)}
              {guessedCharacters.length === 0 && <div className="empty-state"><span className="compass">✳</span><p>The logbook is blank.</p><small>Make your first guess to reveal the clues.</small></div>}
            </div>}
          </div>
          {gameMode === 'classic' ? <div className="legend legend-bottom" aria-label="Clue color legend"><span><i className="legend-swatch exact" /> GREEN · EXACT MATCH</span><span><i className="legend-swatch close" /> YELLOW · CLOSE OR SHARED</span><span><i className="legend-swatch miss" /> GREY · NO MATCH</span><span><i className="legend-arrow">↑</i> ARROW · VALUE IS HIGHER</span></div> : <div className="legend legend-bottom" aria-label="Guess result legend"><span><i className="legend-swatch exact" /> GREEN · CORRECT CHARACTER</span><span><i className="legend-swatch miss" /> GREY · NOT THE ANSWER</span></div>}
          <footer className="game-footer"><p>Roster data from <a href="https://oparchive.com/pages/characters.html" target="_blank" rel="noreferrer">One Piece Archive</a>. Gender is inferred where the archive has no field; entries have at most one unknown clue.</p><span>{mode === 'daily' ? `NEXT PUZZLE IN ${countdownText(nextDailyReset(now) - now.getTime())}` : 'UNLIMITED PLAY'}</span></footer>
        </section>

      </main>
      <div className="page-end"><span>GRAND LINE GUESS</span><span>UNOFFICIAL FAN-MADE GAME · NOT AFFILIATED WITH ONE PIECE OR OPARCHIVE</span></div>
      {solved && !dismissWin && <div className="win-overlay" onClick={() => setDismissWin(true)}><section className="win-dialog" role="dialog" aria-modal="true" aria-labelledby="win-title" onClick={(event) => event.stopPropagation()}><button className="win-close" aria-label="Close victory popup" onClick={() => setDismissWin(true)}>×</button><span className="win-eyebrow">✦ THE LOGBOOK IS COMPLETE ✦</span><h2 id="win-title">YOU GOT 'EM!</h2>{gameMode === 'classic' && <img className="win-portrait" src={activeAnswer?.image ?? ''} alt={activeAnswer?.name ?? 'Character'} onError={(event) => { event.currentTarget.hidden = true }} />}<strong className="win-name">{activeAnswer?.name}</strong>{gameMode === 'classic' && <p>{activeGuessCount === 1 ? 'A perfect first shot!' : `Found in ${activeGuessCount} guesses. Nice work, captain.`}</p>}<button className="win-play-again" onClick={() => mode === 'unlimited' ? resetGame(true) : chooseMode('unlimited')}>SAIL AGAIN <span>↗</span></button></section></div>}
    </div>
  )
}

export default App
