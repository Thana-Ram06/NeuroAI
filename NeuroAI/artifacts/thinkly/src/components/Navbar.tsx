import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onAboutClick: () => void;
}

export default function Navbar({ onAboutClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <span className="font-serif text-lg text-foreground tracking-tight select-none">NeuroAI</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAboutClick}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium px-3 rounded-lg"
            data-testid="button-nav-about"
          >
            About
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
