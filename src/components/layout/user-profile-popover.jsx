"use client";

import PropTypes from "prop-types";
import { LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { signOutAction } from "@/app/actions/auth";
import { getUserProfileSummary } from "@/components/layout/services/profile";

export function UserProfilePopover({ user }) {
  const { displayName, email, initials } = getUserProfileSummary(user);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
        >
          {initials}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-64 border-zinc-700 bg-zinc-900 text-zinc-200"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-zinc-100">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{displayName}</p>
              <p className="truncate text-xs text-zinc-400">{email}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

UserProfilePopover.propTypes = {
  user: PropTypes.object,
};
