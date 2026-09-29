import { useEffect, useRef, useState } from 'react'
import type { Character } from './characters'
import './PiratesJourney.css'

const storageKey = 'pirates-journey-daily-v1'
const scoreTarget = 360
const roles = [
  { id: 'captain', label: 'Captain', number: '01' },
  { id: 'first-mate', label: 'First Mate', number: '02' },
  { id: 'navigator', label: 'Navigator', number: '03' },
  { id: 'cook', label: 'Cook', number: '04' },
  { id: 'doctor', label: 'Doctor', number: '05' },
  { id: 'archaeologist', label: 'Archaeologist', number: '06' },
  { id: 'shipwright', label: 'Shipwright', number: '07' },
  { id: 'combatant-1', label: 'Combatant', number: '08' },
  { id: 'combatant-2', label: 'Combatant', number: '09' },
  { id: 'combatant-3', label: 'Combatant', number: '10' },
] as const

type RoleId = typeof roles[number]['id']
type JourneyMode = 'daily' | 'unlimited'
type JourneyRun = {
  day: number
  crew: Partial<Record<RoleId, string>>
  currentId: string | null
  passesLeft: number
  seenIds: string[]
}

function utcDay() {
  const now = new Date()
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000)
}

function newRun(): JourneyRun {
  return { day: utcDay(), crew: {}, currentId: null, passesLeft: 3, seenIds: [] }
}

function readRun(): JourneyRun {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as JourneyRun | null
    if (saved?.day === utcDay() && saved.crew && Array.isArray(saved.seenIds)) return saved
  } catch {
    return newRun()
  }
  return newRun()
}

function normalizedName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function nameMatches(name: string, aliases: string[]) {
  return aliases.some((alias) => {
    const normalizedAlias = normalizedName(alias)
    return normalizedAlias.length <= 3 ? name === normalizedAlias : name === normalizedAlias || name.endsWith(normalizedAlias)
  })
}

function powerText(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

function roleBonus(roleId: RoleId, character: Character) {
  const name = normalizedName(character.name)
  const hasConquerors = character.haki.some((haki) => haki.toLowerCase().includes('conqueror'))
  if (roleId === 'captain') {
    if (nameMatches(name, ['Monkey D. Luffy', 'Shanks', 'Buggy', 'Portgas D. Ace', 'Gol D. Roger', 'Edward Newgate', 'Marshall D. Teach', 'Kaido', 'Charlotte Linlin', 'Eustass Kid', 'Trafalgar D. Water Law', 'Boa Hancock', 'Crocodile', 'Donquixote Doflamingo', 'Gecko Moria', 'Arlong', 'Don Krieg', 'Kuro', 'Alvida', 'Foxy', 'Hody Jones', 'Cavendish', 'Bartolomeo', 'Bellamy', 'Capone Bege', 'Jewelry Bonney', 'Scratchmen Apoo', 'Basil Hawkins', 'X Drake', 'Urouge', 'Caribou', 'Fisher Tiger', 'Dorry', 'Brogy', 'Vander Decken IX'])) return 8
    if (nameMatches(name, ['Wyper', 'Hajrudin', 'Sengoku', 'Sakazuki', 'Kuzan', 'Borsalino', 'Issho', 'Aramaki', 'Monkey D. Garp'])) return 4
  }
  if (roleId === 'first-mate') {
    if (hasConquerors || (character.bounty ?? 0) >= 1_000_000_000) return 5
    if (nameMatches(name, ['Roronoa Zoro', 'Killer', 'Benn Beckman', 'Silvers Rayleigh', 'Marco', 'King', 'Shiryu', 'Bepo', 'Jozu', 'Vista', 'Mihawk'])) return 4
  }
  if (roleId === 'navigator') {
    if (nameMatches(name, ['Nami', 'Bepo'])) return 4
    if (nameMatches(name, ['Mont Blanc Noland'])) return 2
  }
  if (roleId === 'cook') {
    if (nameMatches(name, ['Vinsmoke Sanji', 'Zeff', 'Streusen'])) return 4
    if (nameMatches(name, ['Charlotte Cracker', 'Patty', 'Carne'])) return 2
  }
  if (roleId === 'doctor') {
    if (nameMatches(name, ['Tony Tony Chopper', 'Trafalgar D. Water Law', 'Law', 'Marco', 'Kureha', 'Crocus', 'Hiriluk', 'Hogback', 'Mansherry'])) return 4
    if (nameMatches(name, ['Vinsmoke Reiju', 'Emporio Ivankov'])) return 2
  }
  if (roleId === 'archaeologist') {
    if (nameMatches(name, ['Nico Robin', 'Nico Olvia', 'Clou D. Clover', 'Professor Clover', 'Clover', 'Vegapunk'])) return 4
    if (nameMatches(name, ['Mont Blanc Noland'])) return 2
  }
  if (roleId === 'shipwright') {
    if (nameMatches(name, ['Franky', 'Iceburg', 'Tom', 'Paulie', 'Den'])) return 4
    if (nameMatches(name, ['Kaku', 'Oimo', 'Kashii', 'Zambai'])) return 2
  }
  return 0
}

function roleFits(roleId: RoleId, character: Character) {
  return roleId.startsWith('combatant-') || roleBonus(roleId, character) > 0
}

function bestRoleFit(character: Character) {
  const match = roles
    .filter((role) => !role.id.startsWith('combatant-'))
    .map((role) => ({ label: role.label, bonus: roleBonus(role.id, character) }))
    .filter((role) => role.bonus > 0)
    .sort((left, right) => right.bonus - left.bonus)[0]
  return match ?? { label: 'Combatant', bonus: 0 }
}

function characterPower(character: Character) {
  const bounty = Math.min(40, ((character.bounty ?? 0) / 5_000_000_000) * 40)
  const fruit = character.devilFruit ? 3 : 0
  const haki = character.haki.reduce((points, type) => points + (type.toLowerCase().includes('conqueror') ? 6 : 2), 0)
  return { bounty, fruit, haki, total: bounty + fruit + haki }
}

function scoreCrew(crew: Partial<Record<RoleId, Character>>) {
  const members = Object.values(crew).filter((character): character is Character => Boolean(character))
  const bountyTotal = members.reduce((total, character) => total + (character.bounty ?? 0), 0)
  const basePower = members.reduce((total, character) => total + characterPower(character).total, 0)
  const accurateRoleCount = roles.filter((role) => crew[role.id] && roleFits(role.id, crew[role.id]!)).length
  const roleAccuracyPoints = accurateRoleCount * 4
  const conquerorsCount = members.filter((character) => character.haki.some((haki) => haki.toLowerCase().includes('conqueror'))).length
  const captain = crew.captain
  const firstMate = crew['first-mate']
  const emperorCore = (captain?.bounty ?? 0) >= 2_500_000_000 && (firstMate?.bounty ?? 0) >= 1_000_000_000 ? 10 : 0
  const bountySynergy = Math.min(12, (bountyTotal / 10_000_000_000) * 12)
  const conquerorsSynergy = conquerorsCount * 5
  const total = basePower + roleAccuracyPoints + conquerorsSynergy + emperorCore + bountySynergy
  const rating = Math.min(100, Math.round((total / scoreTarget) * 100))
  const allRolesAccurate = accurateRoleCount === roles.length
  const tier = rating >= 85 && allRolesAccurate ? 'Pirate King' : rating >= 65 ? 'Emperor' : rating >= 45 ? 'Supernova' : rating >= 25 ? 'Paradise Roamer' : 'East Blue Bound'
  return { rating, tier, basePower: Math.round(basePower), accurateRoleCount, conquerorsSynergy, emperorCore, bountySynergy: Math.round(bountySynergy), allRolesAccurate }
}

type PiratesJourneyProps = { roster: Character[] }

export default function PiratesJourney({ roster }: PiratesJourneyProps) {
  const [mode, setMode] = useState<JourneyMode>('daily')
  const [run, setRun] = useState<JourneyRun>(readRun)
  const [rollingCharacter, setRollingCharacter] = useState<Character | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const rollInterval = useRef<number | null>(null)
  const settleTimeout = useRef<number | null>(null)
  const crew = Object.fromEntries(roles.flatMap((role) => {
    const id = run.crew[role.id]
    const character = id ? roster.find((item) => item.id === id) : undefined
    return character ? [[role.id, character]] : []
  })) as Partial<Record<RoleId, Character>>
  const currentCharacter = roster.find((character) => character.id === run.currentId)
  const shownCharacter = isRolling ? rollingCharacter : currentCharacter
  const roleCandidate = isRolling ? null : currentCharacter
  const currentFit = currentCharacter ? bestRoleFit(currentCharacter) : null
  const currentPower = currentCharacter ? characterPower(currentCharacter) : null
  const crewCount = Object.keys(crew).length
  const complete = crewCount === roles.length
  const stats = complete ? scoreCrew(crew) : null

  useEffect(() => {
    if (mode === 'daily') localStorage.setItem(storageKey, JSON.stringify(run))
  }, [mode, run])

  useEffect(() => {
    if (mode !== 'daily') return
    const timer = window.setInterval(() => {
      setRun((current) => current.day === utcDay() ? current : readRun())
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [mode])

  useEffect(() => () => {
    if (rollInterval.current !== null) window.clearInterval(rollInterval.current)
    if (settleTimeout.current !== null) window.clearTimeout(settleTimeout.current)
  }, [])

  function revealDraw(excludedIds: string[], passesLeft: number) {
    const excluded = new Set(excludedIds)
    const available = roster.filter((character) => !excluded.has(character.id))
    const character = available.length ? available[Math.floor(Math.random() * available.length)] : undefined
    setRun((current) => ({ ...current, currentId: null, passesLeft }))
    if (!character) return

    setIsRolling(true)
    setRollingCharacter(available[0])
    let ticks = 0
    rollInterval.current = window.setInterval(() => {
      ticks += 1
      setRollingCharacter(ticks >= 16 ? character : available[Math.floor(Math.random() * available.length)])
      if (ticks >= 16) {
        if (rollInterval.current !== null) window.clearInterval(rollInterval.current)
        rollInterval.current = null
        settleTimeout.current = window.setTimeout(() => {
          setRun((current) => ({
            ...current,
            currentId: character.id,
            seenIds: current.seenIds.includes(character.id) ? current.seenIds : [...current.seenIds, character.id],
          }))
          setRollingCharacter(null)
          setIsRolling(false)
          settleTimeout.current = null
        }, 420)
      }
    }, 250)
  }

  function spin() {
    if (currentCharacter || complete || isRolling) return
    revealDraw([...Object.values(run.crew), ...run.seenIds], run.passesLeft)
  }

  function pass() {
    if (!currentCharacter || run.passesLeft === 0 || isRolling) return
    revealDraw([...Object.values(run.crew), ...run.seenIds], run.passesLeft - 1)
  }

  function placeCharacter(roleId: RoleId) {
    if (!currentCharacter || run.crew[roleId] || isRolling) return
    setRun((current) => ({ ...current, crew: { ...current.crew, [roleId]: currentCharacter.id }, currentId: null }))
  }

  function chooseMode(nextMode: JourneyMode) {
    if (mode === nextMode) return
    if (rollInterval.current !== null) window.clearInterval(rollInterval.current)
    if (settleTimeout.current !== null) window.clearTimeout(settleTimeout.current)
    rollInterval.current = null
    settleTimeout.current = null
    setRollingCharacter(null)
    setIsRolling(false)
    setMode(nextMode)
    setRun(nextMode === 'daily' ? readRun() : newRun())
  }

  function sailAgain() {
    setRun(newRun())
  }

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="journey-heading">
        <div><span className="journey-kicker">{mode === 'daily' ? 'DAILY' : 'UNLIMITED'} CREW DRAFT · {new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date())}</span><h1 id="journey-title">Pirates Journey</h1><p>Build a crew worthy of the Pirate King.</p></div>
        <div className="journey-heading-side">
          <div className="journey-mode-picker" role="group" aria-label="Journey game mode"><button className={mode === 'daily' ? 'selected' : ''} aria-pressed={mode === 'daily'} onClick={() => chooseMode('daily')}>DAILY</button><button className={mode === 'unlimited' ? 'selected' : ''} aria-pressed={mode === 'unlimited'} onClick={() => chooseMode('unlimited')}>UNLIMITED</button></div>
          <div className="journey-progress"><strong>{crewCount}<span> / 10</span></strong><small>CREW SLOTS FILLED</small></div>
        </div>
      </div>

      <div className="journey-play-area">
        <section className={`spin-panel ${complete ? 'score-panel' : ''}`} aria-label={complete ? 'Crew score' : 'Character draw'}>
          {complete && stats ? <div className="journey-result" aria-live="polite">
            <span className="journey-result-label">VOYAGE COMPLETE</span><div className="journey-score"><strong>{stats.rating}</strong><span>/ 100</span></div><h2>{stats.tier}</h2><p>{stats.tier === 'Pirate King' ? 'The seas have found their king.' : stats.tier === 'Emperor' ? 'Your crew can rule the New World.' : 'Every great voyage starts somewhere.'}</p>
            {stats.rating >= 85 && !stats.allRolesAccurate && <p className="journey-tier-note">Pirate King rank needs an accurate fit in every role.</p>}
            <div className="journey-breakdown"><span>ROLES MATCHED <b>{stats.accurateRoleCount} / 10</b></span><span>BASE POWER <b>{stats.basePower}</b></span><span>CONQUEROR'S SYNERGY <b>{stats.conquerorsSynergy}</b></span><span>BOUNTY SYNERGY <b>{stats.bountySynergy}</b></span><span>EMPEROR CORE <b>{stats.emperorCore}</b></span></div>
            {mode === 'unlimited' && <button className="journey-replay" onClick={sailAgain}>SAIL AGAIN <span aria-hidden="true">↻</span></button>}
          </div> : <>
          <div className="spin-panel-top"><span>THE NEXT CREW MEMBER</span><span>SPINPASS <b>{run.passesLeft}</b></span></div>
          {shownCharacter ? <div className={`drawn-character ${isRolling ? 'rolling' : ''}`}>
            <img key={shownCharacter.id} src={shownCharacter.image ?? ''} alt="" onError={(event) => { event.currentTarget.hidden = true }} />
            <div><small>{isRolling ? 'DRAWING CREW MEMBER' : 'YOU DREW'}</small><strong>{shownCharacter.name}</strong><span>{shownCharacter.affiliation[0] ?? 'Independent'}</span><b>{shownCharacter.bounty === null ? 'BOUNTY UNKNOWN' : `${new Intl.NumberFormat('en-US').format(shownCharacter.bounty)} B`}</b>
              {!isRolling && currentFit && currentPower && <div className="candidate-reveal"><span className="candidate-best-fit"><small>BEST ROLE FIT</small><strong>{currentFit.label}</strong><b>{currentFit.bonus >= 4 ? 'STRONG ROLE FIT' : currentFit.bonus ? 'ALTERNATE ROLE FIT' : 'GENERAL COMBATANT'}</b></span><span className="candidate-power">STRENGTH <strong>+{powerText(currentPower.total)}</strong></span><span className="candidate-power-breakdown"><i>BOUNTY +{powerText(currentPower.bounty)}</i><i>FRUIT +{currentPower.fruit}</i><i>HAKI +{currentPower.haki}</i></span></div>}
            </div>
          </div> : <div className="spin-empty"><span aria-hidden="true">✳</span><p>{crewCount === 10 ? 'Crew complete' : 'A new face awaits.'}</p></div>}
          <div className="spin-actions"><button className="spin-button" onClick={spin} disabled={Boolean(currentCharacter) || complete || isRolling}>{isRolling ? 'ROLLING...' : currentCharacter ? 'CREW MEMBER REVEALED' : 'SPIN'}{!currentCharacter && !isRolling && <span aria-hidden="true"> ↻</span>}</button>{currentCharacter && !isRolling && <button className="pass-button" onClick={pass} disabled={run.passesLeft === 0}>PASS <span>({run.passesLeft})</span></button>}</div>
          {currentCharacter && !isRolling && <p className="slot-instruction">CHARACTER REVEALED · CHOOSE A ROLE</p>}
          </>}
        </section>

        <section className="crew-panel" aria-label="Your crew positions">
          <div className="crew-panel-heading"><div><span>THE THOUSAND SUNNY</span><h2>Your crew</h2></div><small>{crewCount === roles.length ? 'ALL HANDS ABOARD' : `${roles.length - crewCount} POSITIONS OPEN`}</small></div>
          <div className="crew-grid">{roles.map((role) => {
            const member = crew[role.id]
            const bonus = member ? roleBonus(role.id, member) : 0
            const fits = member ? roleFits(role.id, member) : false
            const candidateFits = roleCandidate ? roleFits(role.id, roleCandidate) : false
            return <button key={role.id} className={`crew-slot ${member ? 'filled' : ''} ${roleCandidate && !member ? `available ${candidateFits ? 'role-fit' : 'role-miss'}` : ''}`} onClick={() => placeCharacter(role.id)} disabled={!currentCharacter || Boolean(member) || isRolling} aria-label={`${role.label}${member ? `: ${member.name}${fits ? ', role matched' : ', role mismatch'}` : roleCandidate ? candidateFits ? ', character fits this role' : ', character does not match this role' : ', empty slot'}`}>
              <span className="slot-number">{role.number}</span>{member?.image && <img src={member.image} alt="" onError={(event) => { event.currentTarget.hidden = true }} />}<span className="slot-copy"><b>{role.label}</b><small>{member ? member.name : roleCandidate ? candidateFits ? 'GOOD ROLE FIT' : 'ROLE MISMATCH' : 'EMPTY POSITION'}</small></span>{member && <span className={`slot-bonus ${fits ? bonus >= 4 ? 'matched' : 'alternate' : 'mismatch'}`}>{fits ? bonus >= 4 ? '✓' : '~' : '×'}</span>}
            </button>
          })}</div>
        </section>
      </div>
      <footer className="journey-footer"><span>ROLE FITS, BASE POWER & SYNERGIES SHAPE YOUR SCORE</span><span>{mode === 'daily' ? 'NEW DAILY VOYAGE AT 00:00 UTC' : 'UNLIMITED VOYAGES'}</span></footer>
    </section>
  )
}