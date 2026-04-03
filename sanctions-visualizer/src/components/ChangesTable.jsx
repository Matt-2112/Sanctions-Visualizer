const ACTION_STYLE = {
  add:    { background: '#1a3a1a', color: '#4caf50', border: '1px solid #2e5c2e' },
  remove: { background: '#3a1a1a', color: '#ef5350', border: '1px solid #5c2e2e' },
  modify: { background: '#1a2e3a', color: '#42a5f5', border: '1px solid #2e4a5c' },
}

export default function ChangesTable({ entities }) {
  if (entities.length === 0) {
    return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No results.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Action</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Program(s)</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>List(s)</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => {
            const badge = ACTION_STYLE[e.action] ?? ACTION_STYLE.modify
            return (
              <tr key={e.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ ...badge, padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {e.action.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#e0e0e0', fontWeight: 500 }}>{e.name}</td>
                <td style={{ padding: '10px 12px', color: '#888' }}>{e.entityType}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {e.programs.map((p) => (
                      <span key={p} style={{ background: '#252525', border: '1px solid #333', borderRadius: 4, padding: '1px 6px', fontSize: '0.72rem', color: '#aaa' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: '#888', fontSize: '0.8rem' }}>
                  {e.lists.join(', ') || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
