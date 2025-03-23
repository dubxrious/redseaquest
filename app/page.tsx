import { Suspense } from "react"
import SearchBar from "@/components/search-bar"
import CategoryFilter from "@/components/category-filter"
import TourCard from "@/components/tour-card"
import { executeQuery } from "@/lib/db"

interface HomeProps {
  searchParams: {
    category?: string
    search?: string
  }
}

async function getTours(category?: string, search?: string) {
  let query = `
    SELECT t.*, 
      ARRAY_AGG(DISTINCT c.name) as categories,
      EXISTS(SELECT 1 FROM tour_flags tf WHERE tf.tour_id = t.id AND tf.best_seller = true) as is_best_seller,
      EXISTS(SELECT 1 FROM tour_flags tf WHERE tf.tour_id = t.id AND tf.is_likely_to_sell_out = true) as is_likely_to_sell_out
    FROM tours t
    LEFT JOIN tour_categories tc ON t.id = tc.tour_id
    LEFT JOIN categories c ON tc.category_id = c.id
  `

  const whereConditions = []
  const params: any[] = []

  if (category) {
    whereConditions.push(`c.name ILIKE $${params.length + 1}`)
    params.push(`%${category}%`)
  }

  if (search) {
    whereConditions.push(`(t.abstract ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 1})`)
    params.push(`%${search}%`)
  }

  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(" AND ")}`
  }

  query += ` GROUP BY t.id LIMIT 20`

  try {
    return await executeQuery(query, params)
  } catch (error) {
    console.error("Error fetching tours:", error)
    return []
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { category, search } = searchParams
  const tours = await getTours(category, search)

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Discover Unforgettable Marine Experiences</h1>
        <SearchBar />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
        <CategoryFilter />
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {category
              ? `${category} Tours & Activities`
              : search
                ? `Search Results for "${search}"`
                : "Featured Tours & Activities"}
          </h2>
          <span className="text-sm text-gray-500">{tours.length} results</span>
        </div>

        <Suspense fallback={<div>Loading tours...</div>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tours.length > 0 ? (
              tours.map((tour: any) => <TourCard key={tour.id} tour={tour} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium mb-2">No tours found</h3>
                <p className="text-gray-500">Try adjusting your search or browse our categories</p>
              </div>
            )}
          </div>
        </Suspense>
      </section>
    </div>
  )
}

