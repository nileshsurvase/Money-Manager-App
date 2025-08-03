// Netlify function for Neon database operations
// Handles CRUD operations for expenses, budgets, and categories

const { Pool } = require("pg");
const crypto = require("crypto");

// Initialize database connection
let pool;

const initDB = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || "your_database_url_here",
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
};

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

  try {
    const db = initDB();
    const { path, httpMethod, body } = event;
    const pathSegments = path
      .replace("/.netlify/functions/api", "")
      .split("/")
      .filter(Boolean);

    // Parse request body
    let requestBody = {};
    if (body) {
      try {
        requestBody = JSON.parse(body);
      } catch (e) {
        requestBody = {};
      }
    }

    // Route handling
    if (pathSegments[0] === "expenses") {
      return await handleExpenses(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "diary") {
      return await handleDiary(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "goals") {
      return await handleGoals(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "budgets") {
      return await handleBudgets(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "user") {
      return await handleUser(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "coreos") {
      return await handleCoreOS(db, httpMethod, pathSegments, requestBody);
    } else if (pathSegments[0] === "freedomos") {
      return await handleFreedomOS(db, httpMethod, pathSegments, requestBody);
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Endpoint not found" }),
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};

// Expenses handler
async function handleExpenses(db, method, segments, body) {
  const userId = body.userId || "anonymous";

  try {
    switch (method) {
      case "GET":
        const expenses = await db.query(
          "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC",
          [userId]
        );

        // Transform expenses to match frontend expectations
        const transformedExpenses = expenses.rows.map((expense) => ({
          id: expense.id,
          categoryId: expense.category, // Map category to categoryId
          userId: expense.user_id, // Map user_id to userId
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          createdAt: expense.created_at,
          updatedAt: expense.updated_at,
        }));

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(transformedExpenses),
        };

      case "POST": {
        const {
          id: bodyId,
          amount,
          category_id,
          categoryId,
          description,
          date,
        } = body;
        const finalCategoryId = category_id || categoryId;
        // Always generate a UUID for the database, ignore the incoming ID
        const expenseId = crypto.randomUUID();

        console.log("Creating expense:", {
          expenseId,
          userId,
          amount,
          finalCategoryId,
          description,
          date,
          originalBody: body,
        });

        const newExpense = await db.query(
          "INSERT INTO expenses (id, user_id, amount, category, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [expenseId, userId, amount, finalCategoryId, description, date]
        );

        console.log("Expense created successfully:", newExpense.rows[0]);

        // Transform the response to match frontend expectations
        const responseExpense = {
          id: expenseId, // Use the generated UUID
          categoryId: newExpense.rows[0].category, // Map category to categoryId
          userId: newExpense.rows[0].user_id, // Map user_id to userId
          amount: newExpense.rows[0].amount,
          description: newExpense.rows[0].description,
          date: newExpense.rows[0].date,
          createdAt: newExpense.rows[0].created_at,
          updatedAt: newExpense.rows[0].updated_at,
        };

        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(responseExpense),
        };
      }

      case "PUT":
        const expenseId = segments[1];
        const {
          amount: newAmount,
          category_id,
          categoryId,
          description: newDescription,
          date: newDate,
        } = body;
        const newCategoryId = category_id || categoryId;

        console.log("Updating expense:", {
          expenseId,
          userId,
          newAmount,
          newCategoryId,
          newDescription,
          newDate,
        });

        const updatedExpense = await db.query(
          "UPDATE expenses SET amount = $1, category = $2, description = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
          [newAmount, newCategoryId, newDescription, newDate, expenseId, userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(updatedExpense.rows[0]),
        };

      case "DELETE":
        const deleteId = segments[1];
        await db.query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [
          deleteId,
          userId,
        ]);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Expenses error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Database error",
        details: error.message,
        code: error.code,
      }),
    };
  }
}

// Diary handler
async function handleDiary(db, method, segments, body) {
  const userId = body.userId || "anonymous";

  try {
    switch (method) {
      case "GET":
        const entries = await db.query(
          "SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY date DESC",
          [userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(entries.rows),
        };

      case "POST":
        const { title, content, date, mood, tags } = body;
        const newEntry = await db.query(
          "INSERT INTO diary_entries (user_id, title, content, date, mood, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [userId, title, content, date, mood, JSON.stringify(tags)]
        );
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(newEntry.rows[0]),
        };

      case "PUT":
        const entryId = segments[1];
        const {
          title: newTitle,
          content: newContent,
          mood: newMood,
          tags: newTags,
        } = body;
        const updatedEntry = await db.query(
          "UPDATE diary_entries SET title = $1, content = $2, mood = $3, tags = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
          [
            newTitle,
            newContent,
            newMood,
            JSON.stringify(newTags),
            entryId,
            userId,
          ]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(updatedEntry.rows[0]),
        };

      case "DELETE":
        const deleteId = segments[1];
        await db.query(
          "DELETE FROM diary_entries WHERE id = $1 AND user_id = $2",
          [deleteId, userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Diary error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}

// Goals handler
async function handleGoals(db, method, segments, body) {
  const userId = body.userId || "anonymous";

  try {
    switch (method) {
      case "GET":
        const goals = await db.query(
          "SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC",
          [userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(goals.rows),
        };

      case "POST":
        const { title, description, target_date, category, priority } = body;
        const newGoal = await db.query(
          "INSERT INTO goals (user_id, title, description, target_date, category, priority, status, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [
            userId,
            title,
            description,
            target_date,
            category,
            priority,
            "active",
            0,
          ]
        );
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(newGoal.rows[0]),
        };

      case "PUT":
        const goalId = segments[1];
        const updates = body;
        delete updates.userId;

        const setClause = Object.keys(updates)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(", ");
        const values = [...Object.values(updates), goalId, userId];

        const updatedGoal = await db.query(
          `UPDATE goals SET ${setClause} WHERE id = $${
            values.length - 1
          } AND user_id = $${values.length} RETURNING *`,
          values
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(updatedGoal.rows[0]),
        };

      case "DELETE":
        const deleteId = segments[1];
        await db.query("DELETE FROM goals WHERE id = $1 AND user_id = $2", [
          deleteId,
          userId,
        ]);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Goals error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}

// Budgets handler
async function handleBudgets(db, method, segments, body) {
  const userId = body.userId || "anonymous";

  try {
    switch (method) {
      case "GET":
        const budgets = await db.query(
          "SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC",
          [userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(budgets.rows),
        };

      case "POST":
        const { category, amount, period, start_date, end_date } = body;
        const newBudget = await db.query(
          "INSERT INTO budgets (user_id, category, amount, period, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [userId, category, amount, period, start_date, end_date]
        );
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(newBudget.rows[0]),
        };

      case "PUT":
        const budgetId = segments[1];
        const {
          category: newCategory,
          amount: newAmount,
          period: newPeriod,
        } = body;
        const updatedBudget = await db.query(
          "UPDATE budgets SET category = $1, amount = $2, period = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
          [newCategory, newAmount, newPeriod, budgetId, userId]
        );
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(updatedBudget.rows[0]),
        };

      case "DELETE":
        const deleteId = segments[1];
        await db.query("DELETE FROM budgets WHERE id = $1 AND user_id = $2", [
          deleteId,
          userId,
        ]);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("Budgets error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}

// User handler
async function handleUser(db, method, segments, body) {
  try {
    switch (method) {
      case "POST":
        const { email, name, google_id } = body;

        // Check if user exists
        const existingUser = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (existingUser.rows.length > 0) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(existingUser.rows[0]),
          };
        }

        // Create new user
        const newUser = await db.query(
          "INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *",
          [email, name, google_id]
        );

        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(newUser.rows[0]),
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("User error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}

// CoreOS handler - handles tasks, habits, fitness, mental health
async function handleCoreOS(db, method, segments, body) {
  const userId = body.userId || "anonymous";
  const resource = segments[1]; // tasks, habits, fitness, mental

  try {
    // Handle CoreOS tasks
    if (resource === "tasks") {
      switch (method) {
        case "GET":
          const tasks = await db.query(
            "SELECT * FROM coreos_tasks WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(tasks.rows),
          };

        case "POST":
          const { title, priority, category, date, completed } = body;
          const newTask = await db.query(
            "INSERT INTO coreos_tasks (user_id, title, priority, category, date, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [
              userId,
              title,
              priority || "medium",
              category,
              date,
              completed || false,
            ]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newTask.rows[0]),
          };

        case "PUT":
          const taskId = segments[2];
          const updates = body;
          delete updates.userId;

          const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const values = [...Object.values(updates), taskId, userId];

          const updatedTask = await db.query(
            `UPDATE coreos_tasks SET ${setClause} WHERE id = $${
              values.length - 1
            } AND user_id = $${values.length} RETURNING *`,
            values
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedTask.rows[0]),
          };

        case "DELETE":
          const deleteTaskId = segments[2];
          await db.query(
            "DELETE FROM coreos_tasks WHERE id = $1 AND user_id = $2",
            [deleteTaskId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    // Handle CoreOS habits
    if (resource === "habits") {
      switch (method) {
        case "GET":
          const habits = await db.query(
            "SELECT * FROM coreos_habits WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(habits.rows),
          };

        case "POST":
          const { name, description, frequency } = body;
          const newHabit = await db.query(
            "INSERT INTO coreos_habits (user_id, name, description, frequency, streak, last_completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [userId, name, description, frequency || "daily", 0, null]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newHabit.rows[0]),
          };

        case "PUT":
          const habitId = segments[2];
          const habitUpdates = body;
          delete habitUpdates.userId;

          const habitSetClause = Object.keys(habitUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const habitValues = [...Object.values(habitUpdates), habitId, userId];

          const updatedHabit = await db.query(
            `UPDATE coreos_habits SET ${habitSetClause} WHERE id = $${
              habitValues.length - 1
            } AND user_id = $${habitValues.length} RETURNING *`,
            habitValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedHabit.rows[0]),
          };

        case "DELETE":
          const deleteHabitId = segments[2];
          await db.query(
            "DELETE FROM coreos_habits WHERE id = $1 AND user_id = $2",
            [deleteHabitId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    // Handle CoreOS fitness
    if (resource === "fitness") {
      switch (method) {
        case "GET":
          const fitness = await db.query(
            "SELECT * FROM coreos_fitness WHERE user_id = $1 ORDER BY date DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(fitness.rows),
          };

        case "POST":
          const {
            date: fitnessDate,
            weight,
            workout_type,
            duration,
            calories,
            notes,
          } = body;
          const newFitness = await db.query(
            "INSERT INTO coreos_fitness (user_id, date, weight, workout_type, duration, calories, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [
              userId,
              fitnessDate,
              weight,
              workout_type,
              duration,
              calories,
              notes,
            ]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newFitness.rows[0]),
          };

        case "PUT":
          const fitnessId = segments[2];
          const fitnessUpdates = body;
          delete fitnessUpdates.userId;

          const fitnessSetClause = Object.keys(fitnessUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const fitnessValues = [
            ...Object.values(fitnessUpdates),
            fitnessId,
            userId,
          ];

          const updatedFitness = await db.query(
            `UPDATE coreos_fitness SET ${fitnessSetClause} WHERE id = $${
              fitnessValues.length - 1
            } AND user_id = $${fitnessValues.length} RETURNING *`,
            fitnessValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedFitness.rows[0]),
          };

        case "DELETE":
          const deleteFitnessId = segments[2];
          await db.query(
            "DELETE FROM coreos_fitness WHERE id = $1 AND user_id = $2",
            [deleteFitnessId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    // Handle CoreOS mental health
    if (resource === "mental") {
      switch (method) {
        case "GET":
          const mental = await db.query(
            "SELECT * FROM coreos_mental WHERE user_id = $1 ORDER BY date DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(mental.rows),
          };

        case "POST":
          const {
            date: mentalDate,
            mood,
            energy,
            stress,
            gratitude,
            notes: mentalNotes,
          } = body;
          const newMental = await db.query(
            "INSERT INTO coreos_mental (user_id, date, mood, energy, stress, gratitude, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [userId, mentalDate, mood, energy, stress, gratitude, mentalNotes]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newMental.rows[0]),
          };

        case "PUT":
          const mentalId = segments[2];
          const mentalUpdates = body;
          delete mentalUpdates.userId;

          const mentalSetClause = Object.keys(mentalUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const mentalValues = [
            ...Object.values(mentalUpdates),
            mentalId,
            userId,
          ];

          const updatedMental = await db.query(
            `UPDATE coreos_mental SET ${mentalSetClause} WHERE id = $${
              mentalValues.length - 1
            } AND user_id = $${mentalValues.length} RETURNING *`,
            mentalValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedMental.rows[0]),
          };

        case "DELETE":
          const deleteMentalId = segments[2];
          await db.query(
            "DELETE FROM coreos_mental WHERE id = $1 AND user_id = $2",
            [deleteMentalId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "CoreOS resource not found" }),
    };
  } catch (error) {
    console.error("CoreOS error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}

// FreedomOS handler - handles budget entries, emergency fund, loans
async function handleFreedomOS(db, method, segments, body) {
  const userId = body.userId || "anonymous";
  const resource = segments[1]; // budget, emergency-fund, loans

  try {
    // Handle FreedomOS budget entries
    if (resource === "budget") {
      switch (method) {
        case "GET":
          const budgetEntries = await db.query(
            "SELECT * FROM freedomos_budget_entries WHERE user_id = $1 ORDER BY month DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(budgetEntries.rows),
          };

        case "POST":
          const { month, saved, invested, needs, wants } = body;
          const newBudgetEntry = await db.query(
            "INSERT INTO freedomos_budget_entries (user_id, month, saved, invested, needs, wants) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id, month) DO UPDATE SET saved = EXCLUDED.saved, invested = EXCLUDED.invested, needs = EXCLUDED.needs, wants = EXCLUDED.wants, updated_at = CURRENT_TIMESTAMP RETURNING *",
            [userId, month, saved || 0, invested || 0, needs || 0, wants || 0]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newBudgetEntry.rows[0]),
          };

        case "PUT":
          const budgetId = segments[2];
          const budgetUpdates = body;
          delete budgetUpdates.userId;

          const budgetSetClause = Object.keys(budgetUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const budgetValues = [
            ...Object.values(budgetUpdates),
            budgetId,
            userId,
          ];

          const updatedBudgetEntry = await db.query(
            `UPDATE freedomos_budget_entries SET ${budgetSetClause} WHERE id = $${
              budgetValues.length - 1
            } AND user_id = $${budgetValues.length} RETURNING *`,
            budgetValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedBudgetEntry.rows[0]),
          };

        case "DELETE":
          const deleteBudgetId = segments[2];
          await db.query(
            "DELETE FROM freedomos_budget_entries WHERE id = $1 AND user_id = $2",
            [deleteBudgetId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    // Handle FreedomOS emergency fund
    if (resource === "emergency-fund") {
      switch (method) {
        case "GET":
          const emergencyFund = await db.query(
            "SELECT * FROM freedomos_emergency_fund WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(emergencyFund.rows),
          };

        case "POST":
          const { source_name, amount, instrument_type } = body;
          const newEmergencyFund = await db.query(
            "INSERT INTO freedomos_emergency_fund (user_id, source_name, amount, instrument_type) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, source_name, amount, instrument_type]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newEmergencyFund.rows[0]),
          };

        case "PUT":
          const emergencyId = segments[2];
          const emergencyUpdates = body;
          delete emergencyUpdates.userId;

          const emergencySetClause = Object.keys(emergencyUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const emergencyValues = [
            ...Object.values(emergencyUpdates),
            emergencyId,
            userId,
          ];

          const updatedEmergencyFund = await db.query(
            `UPDATE freedomos_emergency_fund SET ${emergencySetClause} WHERE id = $${
              emergencyValues.length - 1
            } AND user_id = $${emergencyValues.length} RETURNING *`,
            emergencyValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedEmergencyFund.rows[0]),
          };

        case "DELETE":
          const deleteEmergencyId = segments[2];
          await db.query(
            "DELETE FROM freedomos_emergency_fund WHERE id = $1 AND user_id = $2",
            [deleteEmergencyId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    // Handle FreedomOS loans
    if (resource === "loans") {
      switch (method) {
        case "GET":
          const loans = await db.query(
            "SELECT * FROM freedomos_loans WHERE user_id = $1 ORDER BY due_date ASC",
            [userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(loans.rows),
          };

        case "POST":
          const { loan_name, principal, interest_rate, emi, tenure, due_date } =
            body;
          const newLoan = await db.query(
            "INSERT INTO freedomos_loans (user_id, loan_name, principal, interest_rate, emi, tenure, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [userId, loan_name, principal, interest_rate, emi, tenure, due_date]
          );
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newLoan.rows[0]),
          };

        case "PUT":
          const loanId = segments[2];
          const loanUpdates = body;
          delete loanUpdates.userId;

          const loanSetClause = Object.keys(loanUpdates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const loanValues = [...Object.values(loanUpdates), loanId, userId];

          const updatedLoan = await db.query(
            `UPDATE freedomos_loans SET ${loanSetClause} WHERE id = $${
              loanValues.length - 1
            } AND user_id = $${loanValues.length} RETURNING *`,
            loanValues
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedLoan.rows[0]),
          };

        case "DELETE":
          const deleteLoanId = segments[2];
          await db.query(
            "DELETE FROM freedomos_loans WHERE id = $1 AND user_id = $2",
            [deleteLoanId, userId]
          );
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true }),
          };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "FreedomOS resource not found" }),
    };
  } catch (error) {
    console.error("FreedomOS error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Database error", details: error.message }),
    };
  }
}
