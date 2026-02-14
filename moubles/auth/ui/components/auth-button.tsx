"use client";

import { Button } from "@/components/ui/button";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  {
    /** TODO: add diffenernt auth state */
  }
  return (
    <>
    <SignedIn>
    <UserButton>
          <UserButton.MenuItems>
            {/** TODO: add user profile menu button */}
            <UserButton.Link
            label = "Studio"
            href="/studio"
            labelIcon = {<ClapperboardIcon className="size-4"/>}
            >

            </UserButton.Link>
          </UserButton.MenuItems>
      </UserButton>
    {/**add menu items studio and user profile   */}
    </SignedIn>


      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/2
    rounded-full shadow-none "
          >
            <UserCircleIcon />
            sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};
