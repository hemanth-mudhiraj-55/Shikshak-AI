import React from 'react';
import {
  Menu,
  LayoutDashboard,
  BarChart3,
  Users,
  Filter,
  ChevronDown,
  Search,
  Plus,
  Sun,
  Bell,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Package,
  Settings
} from "lucide-react";
import defaultAvatar from "../../../../assets/userprofile.svg";
import './Header.css';

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
const storedUser = JSON.parse(localStorage.getItem("user"));

const user = {
  profilePic: storedUser?.profilePicture || null,
  name: storedUser?.username || "User",
  username: storedUser?.email || "",
};

  return (
    <div className="header-container">
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={onToggleSidebar}
          >
            <Menu className="menu-icon" />
          </button>

          <div className="welcome-section">
            <h1 className="welcome-title">
              Dashboard
            </h1>
            <p className="welcome-subtitle">
              Welcome back, Alex! here's what's happening today
            </p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />
            <button className="filter-button">
              <Filter className="filter-icon" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Quick Action */}
          <button className="quick-action-button">
            <Plus className="quick-action-icon" />
            <span className="quick-action-text">New</span>
          </button>

          {/* Theme Toggle */}
          <button className="icon-button">
            <Sun className="icon" />
          </button>

          {/* Notification */}
          <button className="notification-button">
            <Bell className="notification-icon" />
            <span className="notification-badge">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="icon-button">
            <Settings className="icon" />
          </button>

          {/* User profile */}
          <div className="user-profile">
            <img
              src={user.profilePic || defaultAvatar}
              alt="User"
              className="user-avatar"
            />
            <div className="user-info">
              <p className="user-name">
                {user.name}
              </p>
              <p className="user-username">
                {user.username}
              </p>
            </div>
            <ChevronDown className="user-dropdown-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}