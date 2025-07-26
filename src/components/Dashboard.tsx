
import React, { useState } from 'react';
import { Tabs } from './ui/Tabs';
import { StartupCheckInChart } from './StartupCheckInChart';
import { AttachmentAnalytics } from './AttachmentAnalytics';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('startups');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
        tabs={[
          { value: 'startups', label: 'Startup Check-Ins' },
          { value: 'attachments', label: 'Attachment Analytics' }
        ]}
      />
      
      {activeTab === 'startups' ? (
        <StartupCheckInChart />
      ) : (
        <AttachmentAnalytics />
      )}
    </div>
  );
}