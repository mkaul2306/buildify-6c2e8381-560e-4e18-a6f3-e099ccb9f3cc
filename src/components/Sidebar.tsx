
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Database 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/attachments', label: 'Attachments', icon: <FileText className="h-5 w-5" /> },
    { path: '/user-activity', label: 'User Activity', icon: <Users className="h-5 w-5" /> },
    { path: '/storage', label: 'Storage', icon: <Database className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-6 text-center text-primary">Internal Analytics</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;