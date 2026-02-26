import React, { useState } from "react";
import defaultAvatar from "../../../../assets/userprofile.svg";
import {
  Menu,
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  ChevronDown,
  ListCheck,
  Book,
  Settings,
  ClipboardList,
  GraduationCap
} from "lucide-react";
import './Sidebar.css';

const menuItems = [
  {
  id: "Dashboard",
  icon: LayoutDashboard,
  label: "Dashboard",
  badge: "New",
},
  {
    id: "Analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  {
    id: "Teachers",
    icon: Users,
    label: "Teachers",
    count: "10",
  },
  {
    id: "Todolist",
    icon: ListCheck,
    label: "To Do List",
    count: "84",
  },
  {
    id: "Books",
    icon: Book,
    label: "Books",
  },
  {
    id: "Messages",
    icon: MessageSquare,
    label: "Messages",
    badge: "12",
  },
  {
    id: "Calendar",
    icon: Calendar,
    label: "Calendar",
  },
  {
    id: "Homework",
    icon: ClipboardList,
    label: "HomeWork",
  },

  {
    id: "Exam",
    icon: GraduationCap,
    label: "Exam",
  },
  {
    id: "Transactions",
    icon: CreditCard,
    label: "Transactions",
  },
  {
    id: "Settings",
    icon: Settings,
    label: "Settings",
  },
];

function Sidebar({ collapsed, onToggle, currentPage, onPageChange }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemid) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemid)) {
      newExpanded.delete(itemid);
    } else {
      newExpanded.add(itemid);
    }
    setExpandedItems(newExpanded);
  };

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const user = {
    profilePic: storedUser?.profilePicture || null,
    name: storedUser?.username || "User",
    username: storedUser?.email || "",
  };

  const isExpanded = (itemId) => expandedItems.has(itemId);

  return (
    
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Logo Section */}
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-wrapper">
          <div className="sidebar-logo-icon" />
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h1 className="sidebar-title">Shikshak</h1>
              <p className="sidebar-subtitle">User Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          const isItemExpanded = isExpanded(item.id);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          
          return (
            <div key={item.id} className="nav-item-container">
              <button
                className={`nav-item-button ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                onClick={() => {
                  if (hasSubmenu) {
                    toggleExpanded(item.id);
                  } else {
                    onPageChange(item.id);
                  }
                }}
              >
                <div className="nav-item-content">
                  <item.icon className="nav-item-icon" />
                  {!collapsed && (
                    <>
                      <span className="nav-item-label">{item.label}</span>
                      {item.badge && (
                        <span className="badge badge-red">{item.badge}</span>
                      )}
                      {item.count && (
                        <span className="badge badge-gray">{item.count}</span>
                      )}
                    </>
                  )}
                </div>
                
                {!collapsed && hasSubmenu && (
                  <ChevronDown className={`chevron-icon ${isItemExpanded ? 'chevron-rotated' : ''}`} />
                )}
              </button>

              {/* Submenu - only render if hasSubmenu and expanded */}
              {!collapsed && hasSubmenu && isItemExpanded && (
                <div className="submenu-container">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      className="submenu-item"
                      onClick={() => onPageChange(subitem.id)}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="sidebar-profile-section">
          <div className="profile-wrapper">
            <img
              src={user.profilePic || defaultAvatar}
              alt="user"
              className="profile-avatar"
            />
            <div className="profile-info">
              <p className="profile-name">{user.name}</p>
              <p className="profile-username">{user.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;