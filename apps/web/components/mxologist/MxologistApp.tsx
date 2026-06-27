"use client";

import { useAuth } from "@clerk/nextjs";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Backdrop from "./Backdrop";
import Nav from "./Nav";
import Landing from "./screens/Landing";
import MyBar from "./screens/MyBar";
import WhatCanIMake from "./screens/WhatCanIMake";
import RecipeDetail from "./screens/RecipeDetail";
import Recommended from "./screens/Recommended";
import Settings from "./screens/Settings";
import { MxologistProvider, useMxologist } from "./store";

function Screens() {
  const { screen } = useMxologist();
  const { isLoaded, isSignedIn } = useAuth();

  // Avoid a flash of the wrong UI before Clerk hydrates the session.
  if (!isLoaded) {
    return <Backdrop />;
  }

  // Signed-out visitors only ever see the landing page.
  if (!isSignedIn) {
    return (
      <>
        <Backdrop />
        <Landing />
      </>
    );
  }

  // Once authenticated, the full app chrome takes over. The store's
  // initial "landing" screen falls through to My Bar.
  return (
    <>
      <Backdrop />
      <div style={{ position: "relative", zIndex: 3 }}>
        <Nav />
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 26px 90px" }}>
          {(screen === "bar" || screen === "landing") && <MyBar />}
          {screen === "make" && <WhatCanIMake />}
          {screen === "detail" && <RecipeDetail />}
          {screen === "rec" && <Recommended />}
          {screen === "settings" && <Settings />}
        </div>
      </div>
    </>
  );
}

export default function MxologistApp() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MxologistProvider>
          <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
            <Screens />
          </div>
        </MxologistProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
