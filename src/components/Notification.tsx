"use client";

import React from "react";
import {
    BellIcon,
    ChatBubbleIcon,
    RocketIcon,
    GearIcon,
    EnvelopeClosedIcon,
    StopwatchIcon
  } from "@radix-ui/react-icons";
  import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";

interface IconWithCountProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  children: React.ReactNode;
}

function IconWithCount({ icon, count, label, children }: IconWithCountProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="relative cursor-pointer">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {icon}
                  {count > 0 && (
                    <Badge className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {count}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              {children}
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface NotificationAndMessageIconProps {
  unreadNotifications: number;
  unreadMessages: number;
}

export function NotificationAndMessageIcon({
  unreadNotifications,
  unreadMessages
}: NotificationAndMessageIconProps) {
  const notifications = [
    { id: 1, message: 'Discount available', description: 'Morbi sapien massa, ultricies at rhoncus at, ullamcorper nec diam', icon: RocketIcon, color: 'text-blue-500' },
    { id: 2, message: 'Account has been verified', description: 'Mauris libero ex, iaculis vitae rhoncus et', icon: EnvelopeClosedIcon, color: 'text-purple-500' },
    { id: 3, message: 'Order shipped successfully', description: 'Integer aliquam eros nec sollicitudin', icon: StopwatchIcon, color: 'text-green-500' },
    { id: 4, message: 'Order pending: ID 305830', description: 'Ultricies at rhoncus at ullamcorper', icon: GearIcon, color: 'text-orange-500' },
  ];

  const messages = [
    { id: 1, sender: 'Cameron Williamson', time: '10:13 PM', message: 'Hello?' },
    { id: 2, sender: 'Ralph Edwards', time: '10:13 PM', message: 'Are you there? Interested it this...' },
    { id: 3, sender: 'Eleanor Pena', time: '10:13 PM', message: 'Interested in the loads?' },
    { id: 4, sender: 'Jane Cooper', time: '10:13 PM', message: 'Okay... Do we have a deal?' },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4 mr-4">
        <IconWithCount
          icon={<BellIcon className="w-6 h-6 text-gray-700 dark:text-white" />}
          count={unreadNotifications}
          label="Notifications"
        >
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex items-start gap-3 py-3">
                <notification.icon className={`h-6 w-6 ${notification.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-blue-600">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </IconWithCount>

        <IconWithCount
          icon={<ChatBubbleIcon className="w-6 h-6 text-gray-700 dark:text-white" />}
          count={unreadMessages}
          label="Messages"
        >
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Messages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {messages.map((message) => (
              <DropdownMenuItem key={message.id} className="flex items-start gap-3 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/avatars/${message.sender.toLowerCase().replace(' ', '-')}.jpg`} alt={message.sender} />
                  <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium">{message.sender}</p>
                    <p className="text-xs text-muted-foreground">{message.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.message}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-blue-600">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </IconWithCount>
      </div>
    </TooltipProvider>
  );
}