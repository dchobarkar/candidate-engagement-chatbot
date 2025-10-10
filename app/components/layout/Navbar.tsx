interface NavbarProps {
  activeView: "chat" | "profile" | "job";
  onViewChange: (view: "chat" | "profile" | "job") => void;
  showMobileMenu: boolean;
  onToggleMobileMenu: () => void;
  jobContext?: {
    title: string;
  } | null;
  currentSession?: {
    id: string;
  } | null;
}

const Navbar = ({
  activeView,
  onViewChange,
  showMobileMenu,
  onToggleMobileMenu,
  jobContext,
  currentSession,
}: NavbarProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>

            <h1 className="text-xl font-semibold text-gray-900">
              Candidate Engagement
            </h1>
            {jobContext && (
              <span className="text-sm text-gray-500">
                • {jobContext.title}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange("chat")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "chat"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => onViewChange("profile")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "profile"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => onViewChange("job")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "job"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Job Info
            </button>
          </nav>

          {/* Session Info */}
          <div className="hidden md:flex items-center space-x-4">
            {currentSession && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Session</p>
                <p className="text-sm font-mono text-gray-700">
                  {currentSession.id.substring(0, 8)}...
                </p>
              </div>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => onViewChange("chat")}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  activeView === "chat"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Chat Interface
              </button>
              <button
                onClick={() => onViewChange("profile")}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  activeView === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Candidate Profile
              </button>
              <button
                onClick={() => onViewChange("job")}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  activeView === "job"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Job Information
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
