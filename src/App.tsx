
import React from 'react';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ThemeToggle } from './components/ui/ThemeToggle';

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
          
          <Dashboard />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;