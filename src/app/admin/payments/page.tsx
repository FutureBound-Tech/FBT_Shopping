import React from 'react';

export default function PaymentsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Payments</h1>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Payment transaction logs.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '2rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem' }}>Transaction ID</th>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payment records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
