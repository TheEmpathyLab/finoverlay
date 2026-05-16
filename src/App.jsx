import React, { useState } from 'react';
import DomainSelector from './components/DomainSelector.jsx';
import StratumView from './components/StratumView.jsx';

export default function App() {
  const [selectedDomainId, setSelectedDomainId] = useState(null);

  if (!selectedDomainId) {
    return <DomainSelector onSelect={setSelectedDomainId} />;
  }

  return (
    <StratumView
      domainId={selectedDomainId}
      onChangeDomain={() => setSelectedDomainId(null)}
    />
  );
}
