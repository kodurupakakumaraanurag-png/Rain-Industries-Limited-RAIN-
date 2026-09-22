'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  Target,
  CalendarCheck,
  CheckSquare,
  BarChart3,
  UserCog,
  FileCheck2,
  Settings,
  ChevronDown,
  Layers,
  Factory,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ userRole = 'ADMIN', onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navigationGroup = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CRM Core',
      items: [
        { name: 'Leads', href: '/leads', icon: Layers },
        { name: 'Companies', href: '/companies', icon: Building2 },
        { name: 'Contacts', href: '/contacts', icon: Users },
        { name: 'Pipeline', href: '/pipeline', icon: Kanban },
        { name: 'Opportunities', href: '/opportunities', icon: Target },
      ],
    },
    {
      group: 'Productivity',
      items: [
        { name: 'Activities', href: '/activities', icon: CalendarCheck },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      ],
    },
    {
      group: 'Analytics',
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      group: 'Administration',
      items: [
        ...(userRole === 'ADMIN' ? [{ name: 'Users', href: '/users', icon: UserCog }] : []),
        ...(userRole === 'ADMIN' || userRole === 'SALES_MANAGER'
          ? [{ name: 'Audit Logs', href: '/audit-logs', icon: FileCheck2 }]
          : []),
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg border border-blue-400/30">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm leading-tight">
              RAIN <span className="text-blue-400">CRM</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Manufacturing Platform
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Client Identity Pill */}
      <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-slate-200 truncate">Rain Industries Ltd (RAIN)</p>
          <p className="text-[10px] text-slate-400 truncate">Hyderabad, Telangana</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {navigationGroup.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-blue-400' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-medium text-slate-300">
              Role: <strong className="text-white uppercase">{userRole}</strong>
            </span>
          </div>
          <Link
            href="/login"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
