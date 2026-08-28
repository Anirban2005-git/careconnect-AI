import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { AuthPages } from "./components/auth/AuthPages.tsx";
import { WelcomeSplash } from "./components/WelcomeSplash.tsx";
import App from "./App.tsx";
import "./index.css";

function Root() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const finishWelcome = useCallback(() => setShowWelcome(false), []);

  if (showWelcome) {
    return <WelcomeSplash onFinished={finishWelcome} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading CareConnect AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPages />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
