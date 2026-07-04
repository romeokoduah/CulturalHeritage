/**
 * A seeded cohort of explorers so leaderboards feel alive before a real backend
 * lands. The signed-in user is merged into these boards by their actual stats.
 * Clearly a demo cohort — replace with live data once accounts sync.
 */
export interface Explorer {
  id: string
  name: string
  country: string
  flag: string
  archetype: string
  sites: number
  countries: number
  xp: number
}

export const COMMUNITY: Explorer[] = [
  { id: 'c1', name: 'Amara Okafor', country: 'Nigeria', flag: '🇳🇬', archetype: 'griot', sites: 71, countries: 28, xp: 11200 },
  { id: 'c2', name: 'Kenji Tanaka', country: 'Japan', flag: '🇯🇵', archetype: 'pilgrim', sites: 66, countries: 24, xp: 10450 },
  { id: 'c3', name: 'Sofia Rossi', country: 'Italy', flag: '🇮🇹', archetype: 'chronicler', sites: 63, countries: 31, xp: 10100 },
  { id: 'c4', name: 'Mateo Álvarez', country: 'Peru', flag: '🇵🇪', archetype: 'wanderer', sites: 58, countries: 19, xp: 9200 },
  { id: 'c5', name: 'Aïcha Diallo', country: 'Senegal', flag: '🇸🇳', archetype: 'griot', sites: 55, countries: 22, xp: 8900 },
  { id: 'c6', name: 'Liam Murphy', country: 'Ireland', flag: '🇮🇪', archetype: 'urbanist', sites: 52, countries: 26, xp: 8600 },
  { id: 'c7', name: 'Priya Nair', country: 'India', flag: '🇮🇳', archetype: 'curator', sites: 49, countries: 17, xp: 8100 },
  { id: 'c8', name: 'Elena Petrova', country: 'Bulgaria', flag: '🇧🇬', archetype: 'chronicler', sites: 47, countries: 20, xp: 7750 },
  { id: 'c9', name: 'Kwame Mensah', country: 'Ghana', flag: '🇬🇭', archetype: 'griot', sites: 44, countries: 15, xp: 7300 },
  { id: 'c10', name: 'Noor Haddad', country: 'Jordan', flag: '🇯🇴', archetype: 'wanderer', sites: 42, countries: 18, xp: 7050 },
  { id: 'c11', name: 'Lucas Silva', country: 'Brazil', flag: '🇧🇷', archetype: 'urbanist', sites: 40, countries: 21, xp: 6800 },
  { id: 'c12', name: 'Mei Lin', country: 'China', flag: '🇨🇳', archetype: 'pilgrim', sites: 38, countries: 14, xp: 6400 },
  { id: 'c13', name: 'Olga Nowak', country: 'Poland', flag: '🇵🇱', archetype: 'curator', sites: 36, countries: 19, xp: 6100 },
  { id: 'c14', name: 'Tariq Bassam', country: 'Egypt', flag: '🇪🇬', archetype: 'chronicler', sites: 34, countries: 12, xp: 5700 },
  { id: 'c15', name: 'Isabella Costa', country: 'Portugal', flag: '🇵🇹', archetype: 'wanderer', sites: 31, countries: 16, xp: 5300 },
  { id: 'c16', name: 'Daniel Kim', country: 'South Korea', flag: '🇰🇷', archetype: 'urbanist', sites: 29, countries: 13, xp: 4900 },
  { id: 'c17', name: 'Fatima Zahra', country: 'Morocco', flag: '🇲🇦', archetype: 'griot', sites: 27, countries: 11, xp: 4550 },
  { id: 'c18', name: 'Hannah Becker', country: 'Germany', flag: '🇩🇪', archetype: 'curator', sites: 25, countries: 15, xp: 4200 },
  { id: 'c19', name: 'Diego Herrera', country: 'Mexico', flag: '🇲🇽', archetype: 'chronicler', sites: 22, countries: 10, xp: 3800 },
  { id: 'c20', name: 'Yara Haile', country: 'Ethiopia', flag: '🇪🇹', archetype: 'pilgrim', sites: 19, countries: 8, xp: 3300 },
  { id: 'c21', name: 'Emma Laurent', country: 'France', flag: '🇫🇷', archetype: 'urbanist', sites: 17, countries: 12, xp: 3000 },
  { id: 'c22', name: 'Arjun Rao', country: 'India', flag: '🇮🇳', archetype: 'wanderer', sites: 14, countries: 7, xp: 2500 },
  { id: 'c23', name: 'Chloe Ng', country: 'Singapore', flag: '🇸🇬', archetype: 'curator', sites: 11, countries: 9, xp: 2000 },
  { id: 'c24', name: 'Ravi Perera', country: 'Sri Lanka', flag: '🇱🇰', archetype: 'pilgrim', sites: 8, countries: 5, xp: 1400 },
]
