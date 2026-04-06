import React from "react";
import { Wallet } from "lucide-react";
import { cn } from "../utils/utils";

export function AppLogo({ dark = false }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                <Wallet className={cn("h-8 w-8", dark ? "text-white" : "text-white")} />
            </div>
            <div>
                <h1 className={cn("text-3xl font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>Pocket Worth</h1>
                <p className={cn("text-sm", dark ? "text-slate-300" : "text-slate-500")}>Your personal finance command center</p>
            </div>
        </div>
    );
}