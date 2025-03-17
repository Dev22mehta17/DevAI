// import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <div>
        <SignedOut>
            <SignInButton />
            {/* <SignUpButton /> */}
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
    </div>
  );
};

export default Header;