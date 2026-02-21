/*
 * Reports.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Time-entry report page. Fetches a paginated summary from /api/reports/summary
 * with optional date range filters; aggregates work-item totals per project via useMemo.
 * AI-assisted: date-range filter state, useMemo aggregation pattern, BC Gov design system components;
 * reviewed and directed by Ryan Loiselle.
 */

import React, { useState, useMemo } from 'react';
import {
  Button,
  ButtonGroup,
  Heading,
  InlineAlert,
  Select,
  Text,
  TextField,
} from '@bcgov/design-system-react-components';
import { exportToCSV } from '../api/ReportService';
import { useProjects } from '../hooks/useProjects';
import { useReport } from '../hooks/useReport';

const PERIOD_ITEMS = [
  { id: '__all_time__', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

function getPeriodDates(period) {
  const now = new Date();
  switch (period) {
    case 'month':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return {
        from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
      };
    }
    case 'year':
      return {
        from: `${now.getFullYear()}-01-01`,
        to: `${now.getFullYear()}-12-31`,
      };
    default:
      return { from: '', to: '' };
  }
}

export default function Reports() {
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  // For custom period we only refetch when the user explicitly clicks Run Report
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');

  // Compute date params from current period selection
  const dates = useMemo(() => {
    if (period === 'custom')
      return { from: appliedFrom || undefined, to: appliedTo || undefined };
    if (period === '__all_time__' || !period)
      return { from: undefined, to: undefined };
    return getPeriodDates(period);
  }, [period, appliedFrom, appliedTo]);

  const { data: projects = [] } = useProjects();

  const {
    data: report,
    isFetching: loading,
    error: queryError,
  } = useReport({
    from: dates.from,
    to: dates.to,
    projectId: (filterProjectId && filterProjectId !== '__all__') ? filterProjectId : undefined,
  });

  const error = queryError ? (queryError.message || String(queryError)) : null;

  const projectItems = [
    { id: '__all__', label: 'All Projects' },
    ...projects.map(p => ({ id: p.id, label: p.projectNo ? `${p.projectNo} — ${p.name}` : p.name }))
  ];

  const overbudgetCount = report?.projectSummaries?.filter(p => p.isOverBudget).length ?? 0;

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Reports</Heading>
        <Text elementType="p">Summary of hours logged by project, activity code{report?.isPrivilegedView ? ', and user' : ''}.</Text>

        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label="Time Period"
              items={PERIOD_ITEMS}
              selectedKey={period}
              onSelectionChange={key => setPeriod(key ? String(key) : 'month')}
            />
          </div>
          <div style={{ minWidth: '220px' }}>
            <Select
              label="Project"
              items={projectItems}
            selectedKey={filterProjectId || '__all__'}
            onSelectionChange={key => setFilterProjectId(key && key !== '__all__' ? String(key) : '')}
            />
          </div>
          {period === 'custom' && (
            <>
              <TextField label="From" type="date" value={customFrom} onChange={setCustomFrom} />
              <TextField label="To" type="date" value={customTo} onChange={setCustomTo} />
              <div style={{ paddingTop: '1.5rem' }}>
                <Button variant="primary" onPress={() => { setAppliedFrom(customFrom); setAppliedTo(customTo); }}>Run Report</Button>
              </div>
            </>
          )}
        </div>

        {/* Summary Cards */}
        {report && !loading && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <div style={cardStyle('#003366', '#e6ecf3')}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#003366' }}>{report.totalHours}</div>
              <div style={{ color: '#595959', fontSize: '0.9rem' }}>Total Hours Logged</div>
            </div>
            <div style={cardStyle('#1a7f37', '#e6f4ea')}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a7f37' }}>{report.totalItems}</div>
              <div style={{ color: '#595959', fontSize: '0.9rem' }}>Work Entries</div>
            </div>
            <div style={cardStyle(overbudgetCount > 0 ? '#b91c1c' : '#1a7f37', overbudgetCount > 0 ? '#fef2f2' : '#e6f4ea')}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: overbudgetCount > 0 ? '#b91c1c' : '#1a7f37' }}>{overbudgetCount}</div>
              <div style={{ color: '#595959', fontSize: '0.9rem' }}>Overbudget Projects</div>
            </div>
            <div style={cardStyle('#003366', '#e6ecf3')}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#003366' }}>{report.projectSummaries?.length ?? 0}</div>
              <div style={{ color: '#595959', fontSize: '0.9rem' }}>Active Projects</div>
            </div>
          </div>
        )}

        {loading ? <Text elementType="p">Loading report…</Text> : null}

        {/* Project Summary Table */}
        {!loading && report?.projectSummaries?.length > 0 && (
          <div>
            <Heading level={2}>By Project</Heading>
            <table className="bcds-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Est. Hours</th>
                  <th>Actual Hours</th>
                  <th>Variance</th>
                  <th>Entries</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.projectSummaries.map(p => (
                  <tr key={p.projectId} style={{ backgroundColor: p.isOverBudget ? '#fff5f5' : undefined }}>
                    <td><strong>{p.projectNo}</strong> — {p.projectName}</td>
                    <td>{p.estimatedHours != null ? `${p.estimatedHours} hrs` : '—'}</td>
                    <td>{p.actualHours} hrs</td>
                    <td style={{ color: p.isOverBudget ? '#b91c1c' : '#1a7f37', fontWeight: 500 }}>
                      {p.variance != null ? `${p.variance > 0 ? '+' : ''}${p.variance} hrs` : '—'}
                    </td>
                    <td>{p.itemCount}</td>
                    <td>
                      <span style={{ color: p.isOverBudget ? '#b91c1c' : '#1a7f37', fontWeight: 600, fontSize: '0.85em' }}>
                        {p.isOverBudget ? '⚠ Over Budget' : '✓ On Track'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity Code Breakdown */}
        {!loading && report?.activityCodeSummaries?.length > 0 && (
          <div>
            <Heading level={2}>By Activity Code</Heading>
            <table className="bcds-table">
              <thead>
                <tr>
                  <th>Activity Code</th>
                  <th>Total Hours</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {report.activityCodeSummaries.map(a => (
                  <tr key={a.activityCode}>
                    <td><strong>{a.activityCode}</strong></td>
                    <td>{a.totalHours} hrs</td>
                    <td>{a.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Breakdown (admin/manager only) */}
        {!loading && report?.isPrivilegedView && report?.userSummaries?.length > 0 && (
          <div>
            <Heading level={2}>By Team Member</Heading>
            <table className="bcds-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Total Hours</th>
                  <th>Projects</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {report.userSummaries.map(u => (
                  <tr key={u.userId}>
                    <td><strong>{u.fullName || '—'}</strong></td>
                    <td>{u.username}</td>
                    <td>{u.totalHours} hrs</td>
                    <td>{u.projectCount}</td>
                    <td>{u.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && report && (
          <ButtonGroup alignment="start" ariaLabel="Report export actions">
            <Button variant="secondary" onPress={() => exportToCSV(report)}>Export to CSV</Button>
          </ButtonGroup>
        )}

        {!loading && report && report.totalItems === 0 && (
          <Text elementType="p" className="muted">No data found for the selected period and filters.</Text>
        )}
      </section>
    </div>
  );
}

function cardStyle(borderColor, bg) {
  return {
    background: bg,
    border: `2px solid ${borderColor}`,
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    minWidth: '140px',
    textAlign: 'center',
  };
}
