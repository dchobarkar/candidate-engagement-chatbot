const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">HR</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Candidate Engagement
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 text-center max-w-md">
            AI-powered candidate screening and engagement platform
          </p>

          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center">
            © {currentYear} Candidate Engagement. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
