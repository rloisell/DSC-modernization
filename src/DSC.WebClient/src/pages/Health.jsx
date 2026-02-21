/*
 * Health.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Health-check dashboard page. Polls /api/health/details and renders a status card per check.
 * Acts as the frontend counterpart to the /health/details endpoint consumed by OpenShift probes.
 * AI-assisted: interval polling pattern, status-to-colour mapping, table layout; reviewed and directed by Ryan Loiselle.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  Heading,
  InlineAlert,
  Text,
} from '@bcgov/design-system-react-components'
import { useHealthCheck } from '../hooks/useHealthCheck'

/** Map an overall / per-check status string to an InlineAlert variant. */
function statusVariant(status) {
  switch ((status ?? '').toLowerCase()) {
    case 'healthy':
      return 'info'     // blue — BCGOV design system uses info for positive operational state
    case 'degraded':
      return 'warning'
    case 'unhealthy':
      return 'error'
    default:
      return 'info'
  }
}

/** Small coloured badge rendered as a plain span. */
function StatusBadge({ status }) {
  const colours = {
    healthy:   { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
    degraded:  { bg: '#fff3cd', text: '#856404', border: '#ffeeba' },
    unhealthy: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
  }
  const key = (status ?? '').toLowerCase()
  const c = colours[key] ?? { bg: '#e9ecef', text: '#495057', border: '#dee2e6' }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: '600',
      backgroundColor: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {status ?? 'Unknown'}
    </span>
  )
}

/** Countdown showing seconds until next auto-refresh. */
function RefreshCountdown({ intervalMs, lastUpdated }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.round(intervalMs / 1000))

  useEffect(() => {
    setSecondsLeft(Math.round(intervalMs / 1000))
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) return Math.round(intervalMs / 1000)
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdated, intervalMs])

  return (
    <Text elementType="span" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
      Next refresh in {secondsLeft}s
    </Text>
  )
}

export default function Health() {
  const { data, isFetching, isError, error, refetch, dataUpdatedAt } = useHealthCheck()

  const lastChecked = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null

  const overallStatus = data?.status ?? null
  const checks = data?.checks ?? []

  return (
    <div className="page">
      <section className="section stack">
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Heading level={1}>System Health</Heading>
          {overallStatus && <StatusBadge status={overallStatus} />}
        </div>

        <Text elementType="p">
          This dashboard shows the current health of the DSC Modernization API and its
          dependencies. It refreshes automatically every 30 seconds.
        </Text>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="small"
            isDisabled={isFetching}
            onPress={() => refetch()}
          >
            {isFetching ? 'Checking…' : 'Refresh now'}
          </Button>

          {lastChecked && (
            <Text elementType="span" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Last checked: {lastChecked}
            </Text>
          )}

          {!isFetching && lastChecked && (
            <RefreshCountdown intervalMs={30_000} lastUpdated={dataUpdatedAt} />
          )}

          {isFetching && (
            <Text elementType="span" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Checking…
            </Text>
          )}
        </div>

        {/* Error state — cannot reach the API */}
        {isError && (
          <InlineAlert
            variant="error"
            title="Unable to reach the health endpoint"
          >
            <Text elementType="p">
              {error?.message ?? 'The health check API is unreachable. Verify the API server is running.'}
            </Text>
            <Text elementType="p" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
              Endpoint: <code>/api/health/details</code>
            </Text>
          </InlineAlert>
        )}

        {/* Overall status alert */}
        {!isError && overallStatus && (
          <InlineAlert
            variant={statusVariant(overallStatus)}
            title={`Overall status: ${overallStatus}`}
          >
            <Text elementType="p">
              {overallStatus === 'Healthy'
                ? 'All systems are operating normally.'
                : overallStatus === 'Degraded'
                ? 'One or more components are operating in a degraded state. Review the checks below.'
                : 'One or more critical components are unhealthy. Immediate attention may be required.'}
            </Text>
            {data?.totalDuration != null && (
              <Text elementType="p" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Total check duration: {data.totalDuration.toFixed(1)} ms
              </Text>
            )}
          </InlineAlert>
        )}

        {/* Individual checks table */}
        {checks.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <Heading level={2} style={{ marginBottom: '12px' }}>Health Checks</Heading>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.95rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>Check</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Duration (ms)</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Error</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check, i) => (
                  <tr
                    key={check.name ?? i}
                    style={{
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    }}
                  >
                    <td style={tdStyle}>
                      <code style={{ fontWeight: '600' }}>{check.name}</code>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={check.status} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {check.durationMs != null ? check.durationMs.toFixed(1) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {check.description ?? <span style={{ color: '#6c757d' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, color: '#721c24' }}>
                      {check.exception
                        ? <code style={{ fontSize: '0.82rem' }}>{check.exception}</code>
                        : <span style={{ color: '#6c757d' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!isError && !isFetching && checks.length === 0 && !overallStatus && (
          <Text elementType="p" style={{ color: '#6c757d' }}>
            No health data available. Click <strong>Refresh now</strong> to load.
          </Text>
        )}
      </section>
    </div>
  )
}

// ─── Table cell styles ────────────────────────────────────────────────────────
const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: '600',
  color: '#495057',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '10px 12px',
  verticalAlign: 'top',
}
