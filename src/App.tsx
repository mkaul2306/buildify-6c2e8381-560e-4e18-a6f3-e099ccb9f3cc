
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AttachmentAnalytics } from './components/AttachmentAnalytics';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="analytics-theme">
      <div className="min-h-screen p-4 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <ThemeToggle />
          </div>
          
          <Tabs defaultValue="startup-checkins" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="startup-checkins">Startup Check-Ins</TabsTrigger>
              <TabsTrigger value="attachments">Attachment Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="startup-checkins">
              <Dashboard />
            </TabsContent>
            <TabsContent value="attachments">
              <AttachmentAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;