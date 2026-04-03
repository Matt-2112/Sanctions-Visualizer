import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import ChangesTable from './ChangesTable'

const NS = 'https://www.treasury.gov/ofac/DeltaFile/1.0'
const t = (parent, tag) => parent.getElementsByTagNameNS(NS, tag)[0]?.textContent?.trim() ?? ''

function parseData(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')

  const datePublished = t(doc, 'datePublished')
  const publicationType = t(doc, 'publicationType')

  const entities = Array.from(doc.getElementsByTagNameNS(NS, 'entity')).map((el) => {
    const latinTranslation =
      Array.from(el.getElementsByTagNameNS(NS, 'translation')).find(
        (tr) =>
          tr.getElementsByTagNameNS(NS, 'isPrimary')[0]?.textContent === 'true' &&
          tr.getElementsByTagNameNS(NS, 'script')[0]?.textContent === 'Latin'
      ) ?? el.getElementsByTagNameNS(NS, 'translation')[0]

    const programs = Array.from(el.getElementsByTagNameNS(NS, 'sanctionsProgram')).map((p) => p.textContent.trim())
    const lists = Array.from(el.getElementsByTagNameNS(NS, 'sanctionsList')).map((l) => l.textContent.trim())

    return {
      id: el.getAttribute('id'),
      action: el.getAttribute('action'),
      entityType: t(el, 'entityType'),
      name: latinTranslation ? t(latinTranslation, 'formattedFullName') : '—',
      programs,
      lists,
    }
  })

  return { datePublished, publicationType, entities }
}

const STAT_CONFIG = [
  { key: 'total',  label: 'Total Changes', color: '#e0e0e0', bg: '#1e1e1e' },
  { key: 'add',    label: 'Added',          color: '#4caf50', bg: '#1a3a1a' },
  { key: 'remove', label: 'Removed',        color: '#ef5350', bg: '#3a1a1a' },
  { key: 'modify', label: 'Modified',       color: '#42a5f5', bg: '#1a2e3a' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeProgram, setActiveProgram] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get('/api/changes/latest')
      .then((res) => setData(parseData(res.data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    if (!data) return {}
    const counts = { total: data.entities.length, add: 0, remove: 0, modify: 0 }
    data.entities.forEach((e) => { if (counts[e.action] !== undefined) counts[e.action]++ })
    return counts
  }, [data])

  const programs = useMemo(() => {
    if (!data) return []
    const seen = new Set()
    data.entities.forEach((e) => e.programs.forEach((p) => seen.add(p)))
    return ['All', ...Array.from(seen).sort()]
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.entities.filter((e) => {
      const matchesProgram = activeProgram === 'All' || e.programs.includes(activeProgram)
      const q = search.toLowerCase()
      const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.programs.some((p) => p.toLowerCase().includes(q))
      return matchesProgram && matchesSearch
    })
  }, [data, activeProgram, search])

  if (loading) return <p style={{ color: '#aaa', marginTop: '2rem' }}>Loading sanctions data…</p>
  if (error)   return <p style={{ color: '#ef5350', marginTop: '2rem' }}>Error: {error}</p>

  const fmt = new Date(data.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ textAlign: 'left', maxWidth: 960, margin: '0 auto', padding: '0 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>Sanctions Dashboard</h1>
        <p style={{ margin: 0, color: '#888', fontSize: '0.875rem' }}>
          {data.publicationType} · Published {fmt}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {STAT_CONFIG.map(({ key, label, color, bg }) => (
          <div key={key} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 8, padding: '1rem 1.25rem' }}>
            <div style={{ color, fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{stats[key] ?? 0}</div>
            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.35rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or program…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '0.6rem 1rem',
          background: '#1e1e1e', border: '1px solid #333', borderRadius: 6,
          color: '#e0e0e0', fontSize: '0.875rem', marginBottom: '1rem', outline: 'none',
        }}
      />

      {/* Program Filters */}
      {programs.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {programs.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProgram(p)}
              style={{
                padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', cursor: 'pointer',
                border: activeProgram === p ? '1px solid #646cff' : '1px solid #333',
                background: activeProgram === p ? '#2a2a4a' : '#1e1e1e',
                color: activeProgram === p ? '#a0a0ff' : '#888',
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <ChangesTable entities={filtered} />

    </div>
  )
}
