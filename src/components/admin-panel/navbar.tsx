"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { NotificationAndMessageIcon } from "../Notification";
import React, { useState } from "react";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Example unread notifications
  const [unreadMessages, setUnreadMessages] = useState(5); // Example unread messages

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary bg-gradient-to-b from-[#8000FF] to-[#DE00FF]">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <NotificationAndMessageIcon
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
