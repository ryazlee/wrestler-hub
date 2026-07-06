export interface CareerRecord {
  wins: number
  losses: number
}

export interface WrestlerProfile {
  name: string
  school: string
  graduationYear: number
  weightClass: string
  hometown?: string
  grade?: string
  twId?: string
  floId?: string
  usawId?: string
  trackwrestlingUrl?: string
  flowrestlingUrl?: string
  imageUrl?: string
  links?: { label: string; url: string }[]
  careerRecord: CareerRecord
  pins?: number
  techs?: number
  majors?: number
  statsNote?: string
  sources?: ('trackwrestling' | 'flowrestling')[]
}

export interface Accolade {
  title: string
  year: number
  event?: string
  placement?: string
}

export interface TimelineEntry {
  year: number
  team: string
  season?: string
  record?: { wins: number; losses: number }
  falls?: number
  techs?: number
  majors?: number
  source?: 'trackwrestling' | 'flowrestling'
}

export interface Match {
  date: string
  opponent: string
  opponentSchool: string
  opponentTwId?: string
  opponentFloId?: string
  result: 'W' | 'L' | '—'
  method: string
  score?: string
  event: string
  weight?: number
}

export interface WrestlerData {
  profile: WrestlerProfile
  accolades: Accolade[]
  timeline: TimelineEntry[]
  matches: Match[]
}

export interface HeadToHeadRecord {
  opponent: string
  school: string
  wins: number
  losses: number
  opponentTwId?: string
  opponentFloId?: string
}

export interface SearchResult {
  twId: string
  firstName: string
  lastName: string
  stateId: string
  state: string
  birthDate: string
  hometown: string
  floId?: string
  matchType?: 'name' | 'city'
}
