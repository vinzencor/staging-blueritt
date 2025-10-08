import React from "react";
import { 
  ChevronRight, 
  Home, 
  Layers, 
  Search, 
  Package, 
  BarChart3,
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface ModernPageHeaderProps {
  currentpage: React.ReactNode;
  activepage: string;
  mainpage: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ModernPageHeader: React.FC<ModernPageHeaderProps> = ({
  currentpage,
  activepage,
  mainpage,
  showBackButton = false,
  onBack
}) => {
  const getPageIcon = (pageName: string) => {
    switch (pageName.toLowerCase()) {
      case 'intelliscan':
        return <Search className="w-4 h-4" />;
      case 'product vault':
        return <Package className="w-4 h-4" />;
      case 'marginmax':
        return <BarChart3 className="w-4 h-4" />;
      case 'source link':
        return <Layers className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const breadcrumbItems = [
    { name: activepage, icon: <Home className="w-4 h-4" /> },
    { name: mainpage, icon: getPageIcon(mainpage) }
  ];

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 mb-8">
      {/* Clean Header Section */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left: Page Title & Breadcrumb */}
          <div className="flex items-center gap-6">
            {showBackButton && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div>
              {/* Clean Page Title */}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentpage}
                </h1>
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-semibold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Active
                </div>
              </div>

              {/* Simple Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hover:text-emerald-600 cursor-pointer transition-colors">{activepage}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">{mainpage}</span>
              </nav>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200">
              <Search className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-200">
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Navigation Tabs */}
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Module Navigation */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { name: 'Source Link', icon: <Layers className="w-4 h-4" /> },
              { name: 'MarginMax', icon: <BarChart3 className="w-4 h-4" /> },
              { name: 'Product Vault', icon: <Package className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  item.name === mainpage
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">2.4K Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">$1.2M Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">45K Products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPageHeader;
