import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

interface NavigationItemProps {
  to: string
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: string | number
  className?: string
  end?: boolean
}

const NavigationItem = React.forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ to, children, icon, badge, className, end = false, ...props }, ref) => {
    const location = useLocation()
    const isActive = end ? location.pathname === to : location.pathname.startsWith(to)

    return (
      <NavLink
        ref={ref}
        to={to}
        end={end}
        className={({ isActive: navLinkActive }) =>
          cn(
            // Base styles
            "relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group",
            
            // Default state
            "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            
            // Hover animations
            "hover:scale-105 hover:shadow-soft hover:animate-micro-bounce",
            
            // Active state
            (isActive || navLinkActive) && [
              "text-primary bg-primary/10 shadow-soft",
              "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-r",
              "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:animate-nav-highlight"
            ],
            
            // Focus state
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            
            className
          )
        }
        {...props}
      >
        {/* Icon with micro-interactions */}
        {icon && (
          <span className={cn(
            "flex-shrink-0 transition-all duration-200",
            "group-hover:scale-110 group-hover:text-primary",
            (isActive) && "text-primary animate-micro-bounce"
          )}>
            {icon}
          </span>
        )}
        
        {/* Content */}
        <span className="flex-1 transition-all duration-200 group-hover:translate-x-1">
          {children}
        </span>
        
        {/* Badge with animations */}
        {badge && (
          <span className={cn(
            "flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full transition-all duration-200",
            "bg-primary/20 text-primary animate-pulse-glow",
            "group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"
          )}>
            {badge}
          </span>
        )}
        
        {/* Ripple effect on click */}
        <span className="absolute inset-0 rounded-lg overflow-hidden">
          <span className="absolute inset-0 bg-primary/10 scale-0 group-active:scale-100 group-active:animate-ripple transition-transform duration-300 rounded-lg" />
        </span>
      </NavLink>
    )
  }
)
NavigationItem.displayName = "NavigationItem"

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>
  className?: string
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn("flex items-center space-x-2 text-sm animate-slide-in-left", className)}
        {...props}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-muted-foreground animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            {item.href ? (
              <NavLink
                to={item.href}
                className="text-primary hover:text-primary/80 transition-all duration-200 hover:scale-105 hover:underline animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </NavLink>
            ) : (
              <span 
                className="text-muted-foreground font-medium animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode; badge?: string | number }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const InteractiveTabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, activeTab, onTabChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex space-x-1 bg-muted/30 p-1 rounded-lg animate-slide-up", className)}
        {...props}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              // Base styles
              "relative flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 group",
              
              // Hover states
              "hover:scale-105 hover:shadow-soft",
              
              // Active/inactive states
              activeTab === tab.id
                ? "bg-background text-foreground shadow-soft animate-scale-in"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              
              // Focus state
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            {tab.icon && (
              <span className={cn(
                "transition-all duration-200",
                activeTab === tab.id && "text-primary animate-micro-bounce",
                "group-hover:scale-110"
              )}>
                {tab.icon}
              </span>
            )}
            
            {/* Label */}
            <span>{tab.label}</span>
            
            {/* Badge */}
            {tab.badge && (
              <span className={cn(
                "px-1.5 py-0.5 text-xs font-medium rounded-full transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-primary/20 text-primary animate-pulse-glow" 
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                {tab.badge}
              </span>
            )}
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full animate-nav-highlight" />
            )}
          </button>
        ))}
      </div>
    )
  }
)
InteractiveTabs.displayName = "InteractiveTabs"

export {
  NavigationItem,
  Breadcrumb,
  InteractiveTabs
}