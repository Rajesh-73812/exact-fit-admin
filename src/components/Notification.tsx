"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

    return (
        <TooltipProvider>
            <div className="flex items-center space-x-4 mr-4">
            </div>
        </TooltipProvider>
    );
}