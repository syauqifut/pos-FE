import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Clock, LogOut, ChevronUp, ChevronDown } from "lucide-react";
import { menuData } from "../../data/menuData";
import { MenuItem } from "../../types/menu";
import { Dropdown, DropdownItem } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import { t } from "../../utils/i18n";

const getShortName = (name: string): string => {
  const shortNames: { [key: string]: string } = {
    Dashboard: "Home",
    Reports: "Report",
    Transaction: "Trans",
    Inventory: "Stock",
    Setup: "Setup",
  };
  return shortNames[name] || (name.length > 5 ? name.substring(0, 5) : name);
};

interface BottomNavItemProps {
  item: MenuItem;
  isActive: boolean;
  onSelect: (itemId: string, path?: string) => void;
  isDropdownOpen: boolean;
  onToggleDropdown: (itemId: string) => void;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  item,
  isActive,
  onSelect,
  isDropdownOpen,
  onToggleDropdown,
}) => {
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleItemClick = () => {
    if (item.children && item.children.length > 0) {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setDropdownPos({
          x: rect.left + rect.width / 2,
          y: rect.top, // posisi atas tombol
        });
      }
      onToggleDropdown(item.id);
    } else if (item.path) {
      onSelect(item.id, item.path);
      navigate(item.path);
    }
  };

  const handleChildClick = (child: MenuItem, nestedChild?: MenuItem) => {
    const targetItem = nestedChild || child;
    if (targetItem.path) {
      onSelect(targetItem.id, targetItem.path);
      navigate(targetItem.path);
      onToggleDropdown(""); // Close dropdown
    }
  };

  const renderNestedChildren = (children: MenuItem[]) => {
    return children.map((child) => {
      if (child.isLabel) {
        return (
          <div
            key={child.id}
            className="border-b border-gray-100 last:border-b-0"
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
              {child.name}
            </div>
          </div>
        );
      } else if (child.children && child.children.length > 0) {
        return (
          <div
            key={child.id}
            className="border-b border-gray-100 last:border-b-0"
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
              {child.name}
            </div>
            {child.children.map((nestedChild) => (
              <button
                key={nestedChild.id}
                onClick={() => handleChildClick(child, nestedChild)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
              >
                {nestedChild.icon && (
                  <nestedChild.icon className="w-4 h-4 mr-3" />
                )}
                <span>{nestedChild.name}</span>
              </button>
            ))}
          </div>
        );
      } else {
        return (
          <button
            key={child.id}
            onClick={() => handleChildClick(child)}
            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200 border-b border-gray-100 last:border-b-0"
          >
            {child.icon && <child.icon className="w-4 h-4 mr-3" />}
            <span>{child.name}</span>
          </button>
        );
      }
    });
  };

  return (
    <>
      <div className="relative">
        <button
          ref={btnRef}
          onClick={handleItemClick}
          data-nav-button
          className={`relative flex flex-col items-center px-0.5 sm:px-1.5 pt-1 pb-1 sm:pt-2 sm:pb-1.5 rounded-lg transition-colors duration-200 min-w-0 flex-shrink-0 ${
            isActive
              ? "text-primary bg-primary/10"
              : "text-gray-600 hover:text-primary hover:bg-gray-100"
          }`}
          style={{ height: "60px" }}
        >
          {/* Chevron absolute */}
          {item.children && item.children.length > 0 && (
            <span className="absolute top-1 flex items-center justify-center w-full">
              {isDropdownOpen ? (
                  <ChevronDown size={14} strokeWidth={2} />
                ) : (
                  <ChevronUp size={14} strokeWidth={2} />
              )}
            </span>
          )}

          {/* Ikon rata, diberi margin supaya tidak terganggu chevron */}
          <div className="w-5 h-5 flex items-center justify-center mt-2 mb-0.5">
            {item.icon && <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>

          {/* Label */}
          <span className="text-[8px] sm:text-xs font-medium text-center leading-tight whitespace-nowrap">
            <span className="sm:hidden block">{getShortName(item.name)}</span>
            <span className="hidden sm:block">{item.name}</span>
          </span>
        </button>
      </div>

      {/* Dropdown pakai Portal */}
      {isDropdownOpen &&
        item.children &&
        createPortal(
          <div
            data-dropdown-content
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-[calc(100vh-5rem)] overflow-y-auto w-56 sm:w-64"
            style={{
              left: `${dropdownPos.x}px`,
              top: `${dropdownPos.y - 8}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="py-1">{renderNestedChildren(item.children)}</div>
          </div>,
          document.body
        )}
    </>
  );
};

const BottomNavigation = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && event.target) {
        const target = event.target as Element;
        // Check if click is outside dropdown content and nav buttons
        const isInsideDropdown = target.closest("[data-dropdown-content]");
        const isInsideNavButton = target.closest("[data-nav-button]");

        if (!isInsideDropdown && !isInsideNavButton) {
          setOpenDropdownId(null);
        }
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const findActiveMenuItem = (
    items: MenuItem[],
    path: string
  ): string | null => {
    for (const item of items) {
      if (item.path === path) return item.id;
      if (item.children) {
        const found = findActiveMenuItem(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    setActiveItem(findActiveMenuItem(menuData, location.pathname));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSelect = (itemId: string) => setActiveItem(itemId);

  const handleToggleDropdown = (itemId: string) => {
    if (openDropdownId === itemId) {
      setOpenDropdownId(null); // Close if same dropdown is clicked
    } else {
      setOpenDropdownId(itemId); // Open new dropdown (closes previous)
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-between px-1 sm:px-2 py-1 w-full">
        {/* Left Menu (Setengah Layar) */}
        <div className="flex items-center gap-0.5 sm:gap-1 w-1/2 overflow-x-auto scrollbar-hide">
          {menuData.map((item) => (
            <BottomNavItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onSelect={handleSelect}
              isDropdownOpen={openDropdownId === item.id}
              onToggleDropdown={handleToggleDropdown}
            />
          ))}
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 text-xs flex-shrink-0 ml-0.5 sm:ml-1 min-w-0">
          <div className="hidden sm:flex items-center space-x-0.5 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span className="hidden md:inline">{formatDate(currentTime)}</span>
          </div>

          <div className="flex items-center gap-0.5 text-gray-500">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="text-[9px] sm:text-xs whitespace-nowrap">
              {formatTime(currentTime)}
            </span>
          </div>

          <span className="text-gray-300 hidden sm:inline">|</span>

          {user ? (
            <Dropdown
              toggler={
                <span className="text-primary hover:text-primary/80 transition-colors duration-200 text-[9px] sm:text-xs font-medium truncate max-w-12 sm:max-w-20">
                  {user.fullName}
                </span>
              }
              position="right"
              className="relative"
            >
              <DropdownItem
                onClick={handleLogout}
                disabled={isLoading}
                variant="danger"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>
                  {isLoading ? t("auth.signingOut") : t("auth.logout")}
                </span>
              </DropdownItem>
            </Dropdown>
          ) : (
            <div className="flex items-center text-gray-500">
              <span className="text-[9px] sm:text-xs whitespace-nowrap">
                {t("auth.guest")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
