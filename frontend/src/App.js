import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Filter, X, BarChart3, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PLATFORMS = [
  { name: "All", color: "#6366f1" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Flipkart", color: "#2874F0" },
  { name: "Meesho", color: "#9F2089" },
  { name: "Ajio", color: "#C02A31" },
  { name: "JioMart", color: "#0066B2" },
];

const ProductCard = ({ product, isLowest }) => {
  const platform = PLATFORMS.find(p => p.name === product.platform) || PLATFORMS[0];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className={`glass-card group relative overflow-hidden ${
        isLowest ? 'ring-2 ring-green-400' : ''
      }`}
      data-testid={`product-card-${product.id}`}
    >
      {isLowest && (
        <div className="absolute top-3 right-3 z-10" data-testid="best-deal-badge">
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
            BEST DEAL
          </span>
        </div>
      )}
      
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          data-testid="product-image"
        />
        <div 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
          style={{ backgroundColor: platform.color }}
          data-testid="platform-badge"
        >
          {product.platform}
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 min-h-[40px]" data-testid="product-title">
          {product.title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white" data-testid="product-price">
            ₹{product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-400 line-through" data-testid="product-original-price">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>
        
        {product.rating && (
          <div className="flex items-center gap-1" data-testid="product-rating">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-300">{product.rating}</span>
          </div>
        )}
        
        <Button
          className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold"
          onClick={() => window.open(product.url, '_blank')}
          data-testid="view-product-button"
        >
          View on {product.platform}
        </Button>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="glass-card" data-testid="skeleton-card">
    <Skeleton className="h-48 w-full rounded-t-xl bg-white/10" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-4 w-1/2 bg-white/10" />
      <Skeleton className="h-8 w-full bg-white/10" />
      <Skeleton className="h-10 w-full bg-white/10" />
    </div>
  </div>
);

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedPlatform, sortBy]);

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setSearchHistory(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setLoading(true);
    setProducts([]);
    setShowHistory(false);

    try {
      const response = await axios.get(`${API}/search`, {
        params: { q: searchQuery }
      });
      
      if (response.data.length === 0) {
        toast.info("No products found. Try a different search term.");
      } else {
        toast.success(`Found ${response.data.length} products!`);
      }
      
      setProducts(response.data);
      fetchSearchHistory();
    } catch (error) {
      console.error("Search failed", error);
      toast.error("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by platform
    if (selectedPlatform !== "All") {
      filtered = filtered.filter(p => p.platform === selectedPlatform);
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "relevance") {
      filtered.sort((a, b) => b.similarity_score - a.similarity_score);
    }

    setFilteredProducts(filtered);
  };

  const getLowestPriceProductId = () => {
    if (filteredProducts.length === 0) return null;
    const lowest = filteredProducts.reduce((min, p) => p.price < min.price ? p : min);
    return lowest.id;
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  return (
    <div className="App min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-12 pb-6 px-4"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Smart Price Finder
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Compare prices across Amazon, Flipkart, Meesho, Ajio & JioMart
              </p>
            </motion.div>
          </div>
        </motion.header>

        {/* Search Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 pb-8"
        >
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-6">
              <div className="flex gap-3 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search for products... (e.g., 'laptop', 'headphones')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => setShowHistory(true)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                    data-testid="search-input"
                  />
                  
                  {/* Search History Dropdown */}
                  <AnimatePresence>
                    {showHistory && searchHistory.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full glass-card p-2 z-50"
                        data-testid="search-history"
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <History size={14} />
                            Recent Searches
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistory(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        {searchHistory.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleHistoryClick(item.query)}
                            className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded transition-colors"
                            data-testid={`history-item-${idx}`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{item.query}</span>
                              <span className="text-xs text-gray-400">{item.results_count} results</span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold"
                  data-testid="search-button"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters & Sort */}
        {(products.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-6"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3 items-center">
                <Filter className="text-gray-400" size={20} />
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-[180px] glass-card border-white/20 text-white" data-testid="platform-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform.name} value={platform.name}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <TrendingUp className="text-gray-400" size={20} />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] glass-card border-white/20 text-white" data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-gray-300" data-testid="results-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                data-testid="products-grid"
              >
                <AnimatePresence>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isLowest={product.id === getLowestPriceProductId()}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : products.length === 0 && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <BarChart3 className="mx-auto text-gray-500 mb-4" size={64} />
                <h3 className="text-2xl font-semibold text-white mb-2">Start Your Search</h3>
                <p className="text-gray-400">Enter a product name to compare prices across platforms</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
                data-testid="no-results"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">No Results Found</h3>
                <p className="text-gray-400">Try adjusting your filters or search for a different product</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;