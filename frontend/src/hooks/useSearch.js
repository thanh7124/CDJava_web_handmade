import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllProducts } from "../services/product.service";

export default function useSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(initial);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allProducts = getAllProducts() || [];

  useEffect(() => {
    // keep input in sync when URL changes externally
    setSearchValue(initial);
  }, [initial]);

  useEffect(() => {
    if (searchValue.trim().length >= 1) {
      const filtered = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            product.category.toLowerCase().includes(searchValue.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchValue]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

  return {
    searchValue,
    setSearchValue,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSubmit,
    handleSuggestionClick,
  };
}
