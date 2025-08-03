const { Pool } = require("pg");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "your_database_url_here",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Drop existing tables if they exist (for clean slate)
    await pool.query(`
      DROP TABLE IF EXISTS freedomos_loans CASCADE;
      DROP TABLE IF EXISTS freedomos_emergency_fund CASCADE;
      DROP TABLE IF EXISTS freedomos_budget_entries CASCADE;
      DROP TABLE IF EXISTS coreos_mental CASCADE;
      DROP TABLE IF EXISTS coreos_fitness CASCADE;
      DROP TABLE IF EXISTS coreos_habits CASCADE;
      DROP TABLE IF EXISTS coreos_tasks CASCADE;
      DROP TABLE IF EXISTS budgets CASCADE;
      DROP TABLE IF EXISTS goals CASCADE;
      DROP TABLE IF EXISTS diary_entries CASCADE;
      DROP TABLE IF EXISTS expenses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create all necessary tables
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Expenses table
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Diary entries table
      CREATE TABLE IF NOT EXISTS diary_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        content TEXT NOT NULL,
        date DATE NOT NULL,
        mood VARCHAR(50),
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Goals table
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date DATE,
        category VARCHAR(255),
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Budgets table
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        period VARCHAR(50) DEFAULT 'monthly',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CoreOS Tasks table
      CREATE TABLE IF NOT EXISTS coreos_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(50) DEFAULT 'medium',
        category VARCHAR(255),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CoreOS Habits table
      CREATE TABLE IF NOT EXISTS coreos_habits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        frequency VARCHAR(50) DEFAULT 'daily',
        streak INTEGER DEFAULT 0,
        last_completed DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CoreOS Fitness table
      CREATE TABLE IF NOT EXISTS coreos_fitness (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        weight DECIMAL(5,2),
        workout_type VARCHAR(255),
        duration INTEGER,
        calories INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CoreOS Mental Health table
      CREATE TABLE IF NOT EXISTS coreos_mental (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        mood INTEGER CHECK (mood >= 1 AND mood <= 10),
        energy INTEGER CHECK (energy >= 1 AND energy <= 10),
        stress INTEGER CHECK (stress >= 1 AND stress <= 10),
        gratitude TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- FreedomOS data tables
      CREATE TABLE IF NOT EXISTS freedomos_budget_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
        saved DECIMAL(12,2) DEFAULT 0,
        invested DECIMAL(12,2) DEFAULT 0,
        needs DECIMAL(12,2) DEFAULT 0,
        wants DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, month)
      );

      CREATE TABLE IF NOT EXISTS freedomos_emergency_fund (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        source_name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        instrument_type VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS freedomos_loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        loan_name VARCHAR(255) NOT NULL,
        principal DECIMAL(12,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        emi DECIMAL(12,2) NOT NULL,
        tenure INTEGER NOT NULL,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_diary_user_id ON diary_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(date);
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
      CREATE INDEX IF NOT EXISTS idx_coreos_tasks_user_id ON coreos_tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_coreos_habits_user_id ON coreos_habits(user_id);
      CREATE INDEX IF NOT EXISTS idx_coreos_fitness_user_id ON coreos_fitness(user_id);
      CREATE INDEX IF NOT EXISTS idx_coreos_mental_user_id ON coreos_mental(user_id);
      CREATE INDEX IF NOT EXISTS idx_freedomos_budget_user_id ON freedomos_budget_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_freedomos_emergency_user_id ON freedomos_emergency_fund(user_id);
      CREATE INDEX IF NOT EXISTS idx_freedomos_loans_user_id ON freedomos_loans(user_id);
    `);

    await pool.end();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: "Database tables created successfully",
      }),
    };
  } catch (error) {
    console.error("Database initialization error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "Database initialization failed",
        details: error.message,
      }),
    };
  }
};
