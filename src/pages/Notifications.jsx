import React, { useMemo, useState } from 'react';

const Notifications = () => {
  // Demo UI data; wire to API later if/when backend endpoints exist.
  const [filter, setFilter] = useState('all');

  const items = useMemo(
    () => [
      {
        id: 'n1',
        type: 'faith',
        title: 'New faith tip for you',
        body: 'Try a 2-minute reflection: breathe in gratitude, breathe out worries.',
        time: 'Just now',
        unread: true,
      },
      {
        id: 'n2',
        type: 'community',
        title: 'Someone followed you',
        body: 'A new believer joined your circle—say hi in Feed!',
        time: '2h ago',
        unread: true,
      },
      {
        id: 'n3',
        type: 'groups',
        title: 'Group update: Sunday Circle',
        body: 'New discussion started: “Peace in daily decisions.”',
        time: 'Yesterday',
        unread: false,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((x) => x.unread);
    return items.filter((x) => x.type === filter);
  }, [filter, items]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <div className="section-title">Notifications</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            Stay updated with your latest activity.
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'faith', label: 'Faith' },
            { key: 'community', label: 'Community' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              className={
                t.key === filter ? 'btn btn-primary' : 'btn btn-ghost'
              }
              style={{ padding: '0.45rem 0.75rem', fontSize: 13 }}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="card" style={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Nothing here yet</h2>
            <p style={{ opacity: 0.85 }}>
              When new activity happens, it will show up in your notifications.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((n) => (
              <div
                key={n.id}
                className="ui-notification-row"
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 12px',
                  borderRadius: 14,
                  alignItems: 'flex-start',
                  border: '1px solid transparent',
                  marginBottom: 10,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    background:
                      n.type === 'faith'
                        ? 'var(--accent-bg)'
                        : n.type === 'community'
                          ? 'rgba(52,152,219,0.18)'
                          : 'rgba(170,59,255,0.12)',
                    color:
                      n.type === 'faith'
                        ? 'var(--accent)'
                        : n.type === 'community'
                          ? '#2f80ed'
                          : 'var(--accent)',
                  }}
                >
                  {n.type === 'faith' ? '✦' : n.type === 'community' ? '☺' : '◎'}
                </div>

                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-h)' }}>
                      {n.title}
                    </div>
                    {n.unread && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent-border)',
                          color: 'var(--accent)',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Unread
                      </span>
                    )}
                    <div className="muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
                      {n.time}
                    </div>
                  </div>

                  <div className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.4 }}>
                    {n.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;

