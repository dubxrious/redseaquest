"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const popularCategories = [
  "Diving",
  "Snorkeling",
  "Boat Tours",
  "Fishing",
  "Sailing",
  "Whale Watching",
  "Jet Skiing",
  "Parasailing",
  "Kayaking",
  "Surfing",
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"))

  useEffect(() => {
    setSelectedCategory(searchParams.get("category"))
  }, [searchParams])

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      // If already selected, clear the filter
      router.push("/")
      setSelectedCategory(null)
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`)
      setSelectedCategory(category)
    }
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex space-x-2 min-w-max">
        {popularCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category ? "bg-black text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

