import { executeQuery } from "./db"

// Generic type for database entities
export type Entity = {
  id?: number
  [key: string]: any
}

// Tour CRUD operations
export const tourOperations = {
  // Get all tours with optional filtering
  getAll: async (filters: Record<string, any> = {}) => {
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

    // Add filters
    Object.entries(filters).forEach(([key, value], index) => {
      if (key === "category") {
        whereConditions.push(`c.name ILIKE $${params.length + 1}`)
        params.push(`%${value}%`)
      } else if (key === "search") {
        whereConditions.push(`(t.abstract ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 1})`)
        params.push(`%${value}%`)
      } else if (key === "vendor_id") {
        whereConditions.push(`t.vendor_id = $${params.length + 1}`)
        params.push(value)
      }
    })

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` GROUP BY t.id`

    if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(filters.limit)
    }

    return executeQuery(query, params)
  },

  // Get a single tour by ID
  getById: async (id: number) => {
    const query = `
      SELECT t.*, 
        ARRAY_AGG(DISTINCT c.name) as categories,
        EXISTS(SELECT 1 FROM tour_flags tf WHERE tf.tour_id = t.id AND tf.best_seller = true) as is_best_seller,
        EXISTS(SELECT 1 FROM tour_flags tf WHERE tf.tour_id = t.id AND tf.is_likely_to_sell_out = true) as is_likely_to_sell_out
      FROM tours t
      LEFT JOIN tour_categories tc ON t.id = tc.tour_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = $1
      GROUP BY t.id
    `

    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  // Create a new tour
  create: async (tour: Entity) => {
    const {
      abstract,
      description,
      activity_type,
      activity_type_label,
      is_online,
      booked_in_24_hours,
      is_reserve_now_pay_later,
      vendor_id,
    } = tour

    const query = `
      INSERT INTO tours (
        abstract, description, activity_type, activity_type_label, 
        is_online, booked_in_24_hours, is_reserve_now_pay_later, vendor_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `

    const params = [
      abstract,
      description,
      activity_type,
      activity_type_label,
      is_online,
      booked_in_24_hours,
      is_reserve_now_pay_later,
      vendor_id,
    ]

    const result = await executeQuery(query, params)
    return result[0]
  },

  // Update an existing tour
  update: async (id: number, tour: Entity) => {
    const {
      abstract,
      description,
      activity_type,
      activity_type_label,
      is_online,
      booked_in_24_hours,
      is_reserve_now_pay_later,
      vendor_id,
    } = tour

    const query = `
      UPDATE tours
      SET 
        abstract = $1,
        description = $2,
        activity_type = $3,
        activity_type_label = $4,
        is_online = $5,
        booked_in_24_hours = $6,
        is_reserve_now_pay_later = $7,
        vendor_id = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `

    const params = [
      abstract,
      description,
      activity_type,
      activity_type_label,
      is_online,
      booked_in_24_hours,
      is_reserve_now_pay_later,
      vendor_id,
      id,
    ]

    const result = await executeQuery(query, params)
    return result.length > 0 ? result[0] : null
  },

  // Delete a tour
  delete: async (id: number) => {
    const query = `DELETE FROM tours WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },
}

// Category CRUD operations
export const categoryOperations = {
  getAll: async () => {
    const query = `SELECT * FROM categories ORDER BY name`
    return executeQuery(query)
  },

  getById: async (id: number) => {
    const query = `SELECT * FROM categories WHERE id = $1`
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  create: async (category: Entity) => {
    const { name, code, is_primary } = category
    const query = `
      INSERT INTO categories (name, code, is_primary)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await executeQuery(query, [name, code, is_primary])
    return result[0]
  },

  update: async (id: number, category: Entity) => {
    const { name, code, is_primary } = category
    const query = `
      UPDATE categories
      SET name = $1, code = $2, is_primary = $3
      WHERE id = $4
      RETURNING *
    `
    const result = await executeQuery(query, [name, code, is_primary, id])
    return result.length > 0 ? result[0] : null
  },

  delete: async (id: number) => {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },
}

// User CRUD operations
export const userOperations = {
  getAll: async (filters: Record<string, any> = {}) => {
    let query = `SELECT * FROM users`
    const whereConditions = []
    const params: any[] = []

    if (filters.role) {
      whereConditions.push(`role = $${params.length + 1}`)
      params.push(filters.role)
    }

    if (filters.email) {
      whereConditions.push(`email ILIKE $${params.length + 1}`)
      params.push(`%${filters.email}%`)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` ORDER BY created_at DESC`

    if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(filters.limit)
    }

    return executeQuery(query, params)
  },

  getById: async (id: number) => {
    const query = `SELECT * FROM users WHERE id = $1`
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  getByEmail: async (email: string) => {
    const query = `SELECT * FROM users WHERE email = $1`
    const result = await executeQuery(query, [email])
    return result.length > 0 ? result[0] : null
  },

  create: async (user: Entity) => {
    const { email, password_hash, first_name, last_name, phone, role } = user
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const result = await executeQuery(query, [email, password_hash, first_name, last_name, phone, role || "customer"])
    return result[0]
  },

  update: async (id: number, user: Entity) => {
    const { email, first_name, last_name, phone, role } = user
    const query = `
      UPDATE users
      SET 
        email = $1,
        first_name = $2,
        last_name = $3,
        phone = $4,
        role = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `
    const result = await executeQuery(query, [email, first_name, last_name, phone, role, id])
    return result.length > 0 ? result[0] : null
  },

  updatePassword: async (id: number, password_hash: string) => {
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `
    const result = await executeQuery(query, [password_hash, id])
    return result.length > 0
  },

  delete: async (id: number) => {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },
}

// Vendor CRUD operations
export const vendorOperations = {
  getAll: async (filters: Record<string, any> = {}) => {
    let query = `
      SELECT v.*, u.email, u.first_name, u.last_name, u.phone
      FROM vendors v
      JOIN users u ON v.user_id = u.id
    `

    const whereConditions = []
    const params: any[] = []

    if (filters.is_verified !== undefined) {
      whereConditions.push(`v.is_verified = $${params.length + 1}`)
      params.push(filters.is_verified)
    }

    if (filters.search) {
      whereConditions.push(`(v.company_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`)
      params.push(`%${filters.search}%`)
      params.push(`%${filters.search}%`)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` ORDER BY v.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(filters.limit)
    }

    return executeQuery(query, params)
  },

  getById: async (id: number) => {
    const query = `
      SELECT v.*, u.email, u.first_name, u.last_name, u.phone
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = $1
    `
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  getByUserId: async (userId: number) => {
    const query = `
      SELECT v.*, u.email, u.first_name, u.last_name, u.phone
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = $1
    `
    const result = await executeQuery(query, [userId])
    return result.length > 0 ? result[0] : null
  },

  create: async (vendor: Entity) => {
    const {
      user_id,
      company_name,
      description,
      logo_url,
      website,
      contact_email,
      contact_phone,
      commission_rate,
      is_verified,
    } = vendor

    const query = `
      INSERT INTO vendors (
        user_id, company_name, description, logo_url, website, 
        contact_email, contact_phone, commission_rate, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      user_id,
      company_name,
      description,
      logo_url,
      website,
      contact_email,
      contact_phone,
      commission_rate,
      is_verified,
    ]

    const result = await executeQuery(query, params)
    return result[0]
  },

  update: async (id: number, vendor: Entity) => {
    const { company_name, description, logo_url, website, contact_email, contact_phone, commission_rate, is_verified } =
      vendor

    const query = `
      UPDATE vendors
      SET 
        company_name = $1,
        description = $2,
        logo_url = $3,
        website = $4,
        contact_email = $5,
        contact_phone = $6,
        commission_rate = $7,
        is_verified = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `

    const params = [
      company_name,
      description,
      logo_url,
      website,
      contact_email,
      contact_phone,
      commission_rate,
      is_verified,
      id,
    ]

    const result = await executeQuery(query, params)
    return result.length > 0 ? result[0] : null
  },

  delete: async (id: number) => {
    const query = `DELETE FROM vendors WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },
}

// Booking CRUD operations
export const bookingOperations = {
  getAll: async (filters: Record<string, any> = {}) => {
    let query = `
      SELECT b.*, t.abstract as tour_name, u.email as user_email,
        ta.date as tour_date, ta.start_time as tour_time
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN tour_availability ta ON b.availability_id = ta.id
    `

    const whereConditions = []
    const params: any[] = []

    if (filters.user_id) {
      whereConditions.push(`b.user_id = $${params.length + 1}`)
      params.push(filters.user_id)
    }

    if (filters.tour_id) {
      whereConditions.push(`b.tour_id = $${params.length + 1}`)
      params.push(filters.tour_id)
    }

    if (filters.status) {
      whereConditions.push(`b.status = $${params.length + 1}`)
      params.push(filters.status)
    }

    if (filters.payment_status) {
      whereConditions.push(`b.payment_status = $${params.length + 1}`)
      params.push(filters.payment_status)
    }

    if (filters.date_from) {
      whereConditions.push(`ta.date >= $${params.length + 1}`)
      params.push(filters.date_from)
    }

    if (filters.date_to) {
      whereConditions.push(`ta.date <= $${params.length + 1}`)
      params.push(filters.date_to)
    }

    if (filters.vendor_id) {
      whereConditions.push(`t.vendor_id = $${params.length + 1}`)
      params.push(filters.vendor_id)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` ORDER BY b.booking_date DESC`

    if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(filters.limit)
    }

    return executeQuery(query, params)
  },

  getById: async (id: number) => {
    const query = `
      SELECT b.*, t.abstract as tour_name, u.email as user_email,
        ta.date as tour_date, ta.start_time as tour_time
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN tour_availability ta ON b.availability_id = ta.id
      WHERE b.id = $1
    `
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  getByBookingNumber: async (bookingNumber: string) => {
    const query = `
      SELECT b.*, t.abstract as tour_name, u.email as user_email,
        ta.date as tour_date, ta.start_time as tour_time
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN tour_availability ta ON b.availability_id = ta.id
      WHERE b.booking_number = $1
    `
    const result = await executeQuery(query, [bookingNumber])
    return result.length > 0 ? result[0] : null
  },

  create: async (booking: Entity) => {
    // Generate a unique booking number
    const bookingNumber = `RSQ${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`

    const {
      user_id,
      tour_id,
      availability_id,
      adults,
      children,
      total_price,
      special_requests,
      payment_status,
      payment_intent_id,
    } = booking

    const query = `
      INSERT INTO bookings (
        booking_number, user_id, tour_id, availability_id, adults, children, 
        total_price, special_requests, payment_status, payment_intent_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const params = [
      bookingNumber,
      user_id,
      tour_id,
      availability_id,
      adults,
      children,
      total_price,
      special_requests,
      payment_status || "unpaid",
      payment_intent_id,
    ]

    const result = await executeQuery(query, params)

    // Update the spots_booked in tour_availability
    if (result.length > 0) {
      const updateAvailabilityQuery = `
        UPDATE tour_availability
        SET spots_booked = spots_booked + $1
        WHERE id = $2
      `
      await executeQuery(updateAvailabilityQuery, [adults + children, availability_id])
    }

    return result[0]
  },

  update: async (id: number, booking: Entity) => {
    const { status, adults, children, total_price, special_requests, payment_status, payment_intent_id } = booking

    // Get the current booking to calculate the difference in spots
    const currentBooking = await bookingOperations.getById(id)
    const spotsDifference = adults + children - (currentBooking.adults + currentBooking.children)

    const query = `
      UPDATE bookings
      SET 
        status = $1,
        adults = $2,
        children = $3,
        total_price = $4,
        special_requests = $5,
        payment_status = $6,
        payment_intent_id = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `

    const params = [status, adults, children, total_price, special_requests, payment_status, payment_intent_id, id]

    const result = await executeQuery(query, params)

    // Update the spots_booked in tour_availability if there's a change
    if (result.length > 0 && spotsDifference !== 0) {
      const updateAvailabilityQuery = `
        UPDATE tour_availability
        SET spots_booked = spots_booked + $1
        WHERE id = $2
      `
      await executeQuery(updateAvailabilityQuery, [spotsDifference, currentBooking.availability_id])
    }

    return result.length > 0 ? result[0] : null
  },

  updateStatus: async (id: number, status: string) => {
    const query = `
      UPDATE bookings
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    const result = await executeQuery(query, [status, id])
    return result.length > 0 ? result[0] : null
  },

  updatePaymentStatus: async (id: number, paymentStatus: string, paymentIntentId?: string) => {
    const query = `
      UPDATE bookings
      SET 
        payment_status = $1, 
        payment_intent_id = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `
    const result = await executeQuery(query, [paymentStatus, paymentIntentId, id])
    return result.length > 0 ? result[0] : null
  },

  delete: async (id: number) => {
    // Get the booking details first to update availability
    const booking = await bookingOperations.getById(id)

    if (booking) {
      // Update the spots_booked in tour_availability
      const updateAvailabilityQuery = `
        UPDATE tour_availability
        SET spots_booked = spots_booked - $1
        WHERE id = $2
      `
      await executeQuery(updateAvailabilityQuery, [booking.adults + booking.children, booking.availability_id])

      // Delete the booking
      const query = `DELETE FROM bookings WHERE id = $1 RETURNING id`
      const result = await executeQuery(query, [id])
      return result.length > 0
    }

    return false
  },
}

// Tour Availability CRUD operations
export const availabilityOperations = {
  getAll: async (filters: Record<string, any> = {}) => {
    let query = `
      SELECT ta.*, t.abstract as tour_name
      FROM tour_availability ta
      JOIN tours t ON ta.tour_id = t.id
    `

    const whereConditions = []
    const params: any[] = []

    if (filters.tour_id) {
      whereConditions.push(`ta.tour_id = $${params.length + 1}`)
      params.push(filters.tour_id)
    }

    if (filters.date_from) {
      whereConditions.push(`ta.date >= $${params.length + 1}`)
      params.push(filters.date_from)
    }

    if (filters.date_to) {
      whereConditions.push(`ta.date <= $${params.length + 1}`)
      params.push(filters.date_to)
    }

    if (filters.is_available !== undefined) {
      whereConditions.push(`ta.is_available = $${params.length + 1}`)
      params.push(filters.is_available)
    }

    if (filters.vendor_id) {
      whereConditions.push(`t.vendor_id = $${params.length + 1}`)
      params.push(filters.vendor_id)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` ORDER BY ta.date, ta.start_time`

    return executeQuery(query, params)
  },

  getById: async (id: number) => {
    const query = `
      SELECT ta.*, t.abstract as tour_name
      FROM tour_availability ta
      JOIN tours t ON ta.tour_id = t.id
      WHERE ta.id = $1
    `
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  getAvailableSlots: async (tourId: number, date: string) => {
    const query = `
      SELECT *
      FROM tour_availability
      WHERE tour_id = $1 AND date = $2 AND is_available = true AND spots_booked < max_spots
      ORDER BY start_time
    `
    return executeQuery(query, [tourId, date])
  },

  create: async (availability: Entity) => {
    const { tour_id, date, start_time, end_time, max_spots, price_adult, price_child, is_available } = availability

    const query = `
      INSERT INTO tour_availability (
        tour_id, date, start_time, end_time, max_spots, 
        price_adult, price_child, is_available
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const params = [
      tour_id,
      date,
      start_time,
      end_time,
      max_spots,
      price_adult,
      price_child,
      is_available !== undefined ? is_available : true,
    ]

    const result = await executeQuery(query, params)
    return result[0]
  },

  update: async (id: number, availability: Entity) => {
    const { date, start_time, end_time, max_spots, price_adult, price_child, is_available } = availability

    const query = `
      UPDATE tour_availability
      SET 
        date = $1,
        start_time = $2,
        end_time = $3,
        max_spots = $4,
        price_adult = $5,
        price_child = $6,
        is_available = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `

    const params = [date, start_time, end_time, max_spots, price_adult, price_child, is_available, id]

    const result = await executeQuery(query, params)
    return result.length > 0 ? result[0] : null
  },

  delete: async (id: number) => {
    const query = `DELETE FROM tour_availability WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },

  // Bulk create availability for a date range
  bulkCreate: async (tourId: number, startDate: string, endDate: string, slots: any[]) => {
    // Generate dates between start and end
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates = []

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      dates.push(new Date(dt).toISOString().split("T")[0])
    }

    // Insert availability for each date and slot
    const results = []

    for (const date of dates) {
      for (const slot of slots) {
        const { start_time, end_time, max_spots, price_adult, price_child, is_available } = slot

        const availability = {
          tour_id: tourId,
          date,
          start_time,
          end_time,
          max_spots,
          price_adult,
          price_child,
          is_available,
        }

        const result = await availabilityOperations.create(availability)
        results.push(result)
      }
    }

    return results
  },
}

// Payment CRUD operations
export const paymentOperations = {
  getAll: async (filters: Record<string, any> = {}) => {
    let query = `
      SELECT p.*, b.booking_number, u.email as user_email, t.abstract as tour_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
    `

    const whereConditions = []
    const params: any[] = []

    if (filters.booking_id) {
      whereConditions.push(`p.booking_id = $${params.length + 1}`)
      params.push(filters.booking_id)
    }

    if (filters.status) {
      whereConditions.push(`p.status = $${params.length + 1}`)
      params.push(filters.status)
    }

    if (filters.payment_method) {
      whereConditions.push(`p.payment_method = $${params.length + 1}`)
      params.push(filters.payment_method)
    }

    if (filters.date_from) {
      whereConditions.push(`p.payment_date >= $${params.length + 1}`)
      params.push(filters.date_from)
    }

    if (filters.date_to) {
      whereConditions.push(`p.payment_date <= $${params.length + 1}`)
      params.push(filters.date_to)
    }

    if (filters.user_id) {
      whereConditions.push(`b.user_id = $${params.length + 1}`)
      params.push(filters.user_id)
    }

    if (filters.vendor_id) {
      whereConditions.push(`t.vendor_id = $${params.length + 1}`)
      params.push(filters.vendor_id)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` ORDER BY p.payment_date DESC`

    if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(filters.limit)
    }

    return executeQuery(query, params)
  },

  getById: async (id: number) => {
    const query = `
      SELECT p.*, b.booking_number, u.email as user_email, t.abstract as tour_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      WHERE p.id = $1
    `
    const result = await executeQuery(query, [id])
    return result.length > 0 ? result[0] : null
  },

  create: async (payment: Entity) => {
    const { booking_id, amount, currency, payment_method, payment_intent_id, status } = payment

    const query = `
      INSERT INTO payments (
        booking_id, amount, currency, payment_method, 
        payment_intent_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const params = [booking_id, amount, currency || "USD", payment_method, payment_intent_id, status]

    const result = await executeQuery(query, params)

    // Update the booking payment status if payment is successful
    if (result.length > 0 && status === "succeeded") {
      await bookingOperations.updatePaymentStatus(booking_id, "paid", payment_intent_id)
    }

    return result[0]
  },

  update: async (id: number, payment: Entity) => {
    const { status, refund_amount } = payment

    const query = `
      UPDATE payments
      SET 
        status = $1,
        refund_amount = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `

    const result = await executeQuery(query, [status, refund_amount || 0, id])

    // Update the booking payment status if payment status changes
    if (result.length > 0) {
      const payment = result[0]

      if (status === "refunded") {
        await bookingOperations.updatePaymentStatus(payment.booking_id, "refunded")
        await bookingOperations.updateStatus(payment.booking_id, "refunded")
      } else if (status === "succeeded") {
        await bookingOperations.updatePaymentStatus(payment.booking_id, "paid", payment.payment_intent_id)
      }
    }

    return result.length > 0 ? result[0] : null
  },

  delete: async (id: number) => {
    const query = `DELETE FROM payments WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [id])
    return result.length > 0
  },
}

