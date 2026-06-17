import { useOutletContext } from 'react-router-dom';

export default function FreightPlaceholderPage({ title = 'Module' }) {
  const ctx = useOutletContext();
  const label = ctx?.moduleTitle || title;

  return (
    <div className="ws-freight-leads-page">
      <div className="ws-empty" style={{ minHeight: 320 }}>
        <strong>{label}</strong> module is coming soon. Use <strong>Leads</strong> from the left rail to view the full CRM pattern.
      </div>
    </div>
  );
}
