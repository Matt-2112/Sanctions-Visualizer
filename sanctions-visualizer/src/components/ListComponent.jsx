import { useEffect, useState } from 'react'
import axios from 'axios'

function parseEntities(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const ns = 'https://www.treasury.gov/ofac/DeltaFile/1.0'

  const text = (parent, tag) => parent.getElementsByTagNameNS(ns, tag)[0]?.textContent?.trim() ?? ''

  const datePublished = text(doc, 'datePublished')
  const publicationType = text(doc, 'publicationType')

  const entityEls = doc.getElementsByTagNameNS(ns, 'entity')
  const entities = Array.from(entityEls).map((el) => {
    const primaryTranslation = Array.from(el.getElementsByTagNameNS(ns, 'translation')).find(
      (t) => t.getElementsByTagNameNS(ns, 'isPrimary')[0]?.textContent === 'true' &&
             t.getElementsByTagNameNS(ns, 'script')[0]?.textContent === 'Latin'
    ) ?? el.getElementsByTagNameNS(ns, 'translation')[0]

    return {
      id: el.getAttribute('id'),
      action: el.getAttribute('action'),
      entityType: text(el, 'entityType'),
      name: primaryTranslation ? text(primaryTranslation, 'formattedFullName') : '—',
      sanctionsList: text(el, 'sanctionsList'),
      sanctionsProgram: text(el, 'sanctionsProgram'),
    }
  })

  return { datePublished, publicationType, entities }
}

const ACTION_STYLES = {
  add:    { background: '#1a3a1a', color: '#4caf50', border: '1px solid #2e5c2e' },
  remove: { background: '#3a1a1a', color: '#ef5350', border: '1px solid #5c2e2e' },
  modify: { background: '#1a2e3a', color: '#42a5f5', border: '1px solid #2e4a5c' },
}

export default function ListComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/changes/latest')
      .then((res) => {
        setData(parseEntities(res.data))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#aaa' }}>Loading sanctions data…</p>
  if (error)   return <p style={{ color: '#ef5350' }}>Error: {error}</p>

  const { datePublished, publicationType, entities } = data
  const fmt = new Date(datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', color: '#aaa', fontSize: '0.9rem' }}>
        <strong style={{ color: '#fff' }}>{publicationType}</strong> — published {fmt} — {entities.length} change{entities.length !== 1 ? 's' : ''}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <th style={{ padding: '6px 12px', textAlign: 'left' }}>Action</th>
            <th style={{ padding: '6px 12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '6px 12px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '6px 12px', textAlign: 'left' }}>Program</th>
            <th style={{ padding: '6px 12px', textAlign: 'left' }}>List</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => {
            const style = ACTION_STYLES[e.action] ?? ACTION_STYLES.modify
            return (
              <tr key={e.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ ...style, padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                    {e.action}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', color: '#e0e0e0' }}>{e.name}</td>
                <td style={{ padding: '8px 12px', color: '#aaa' }}>{e.entityType}</td>
                <td style={{ padding: '8px 12px', color: '#aaa' }}>{e.sanctionsProgram || '—'}</td>
                <td style={{ padding: '8px 12px', color: '#aaa' }}>{e.sanctionsList || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
