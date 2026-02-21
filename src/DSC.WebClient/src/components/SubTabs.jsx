/*
 * SubTabs.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Reusable secondary tab bar for admin sub-sections.
 * Accepts a tabs config array ({ id, label }[]), the active tab ID, and an onTabChange callback.
 * AI-assisted: ARIA tablist markup, active-tab styling pattern; reviewed and directed by Ryan Loiselle.
 */

export default function SubTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: '2px solid #e0e0e0',
        marginBottom: '1.25rem',
        background: '#f5f7fa',
        borderRadius: '4px 4px 0 0',
        padding: '0 0.5rem',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #003366' : '2px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === tab.id ? '600' : '400',
            color: activeTab === tab.id ? '#003366' : '#595959',
            fontSize: '0.875rem',
            transition: 'color 0.15s, border-bottom-color 0.15s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
