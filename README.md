# 💰 MoneyManager Premium

A beautiful, modern expense tracking and budget management application built with React, featuring premium glassmorphism UI, Indian currency support, Google authentication, and cloud database integration.

## ✨ Features

### 🎨 **Premium UI/UX**
- **Glassmorphism Design** - Beautiful frosted glass effects with backdrop blur
- **Orange & Green Theme** - Premium color scheme avoiding common blues/reds
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Responsive Design** - Perfect on desktop and mobile devices
- **Dark/Light Mode** - Seamless theme switching with system preference detection

### 💰 **Financial Management**
- **Expense Tracking** - Add, edit, and categorize expenses with ease
- **Budget Management** - Set monthly budgets for different categories
- **Indian Currency Support** - ₹ symbol with proper Indian number formatting (lakhs/crores)
- **Multiple Categories** - Food, Transport, Shopping, Health, Utilities, and more
- **Advanced Filtering** - Filter by date, category, amount ranges

### 📊 **Analytics & Insights**
- **Interactive Charts** - Pie charts, line graphs, and bar charts using Recharts
- **Monthly Trends** - Track spending patterns over time
- **Budget Progress** - Visual progress bars with color-coded alerts
- **Category Breakdown** - Detailed spending analysis by category
- **Comparative Analysis** - Month-over-month spending comparisons

### 🔐 **Authentication & Security**
- **Google OAuth** - Secure one-click login with Google
- **User Profiles** - Personalized experience with user data
- **Session Management** - Secure session handling and logout

### ☁️ **Cloud Integration**
- **Neon Database** - PostgreSQL cloud database for data persistence
- **Real-time Sync** - Automatic synchronization across devices
- **Local Storage Fallback** - Works offline with local storage backup
- **Data Export/Import** - Backup and restore your financial data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google OAuth credentials
- Neon database (optional, falls back to local storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd money-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root:
   ```bash
   touch .env
   ```
   
   Add your credentials to `.env`:
   ```env
   # Required Variables
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_DATABASE_URL=your_neon_database_url
   
   # Optional Variables  
   VITE_API_ENDPOINT=/.netlify/functions/api
   VITE_SENTRY_DSN=your_sentry_dsn
   VITE_ANALYTICS_ID=your_analytics_id
   
   # Server-side (for Netlify Functions)
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
   
   **⚠️ Security:** Never commit actual credentials to version control!

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Premium button with animations
│   ├── Card.jsx        # Glassmorphism card component
│   ├── Modal.jsx       # Animated modal with backdrop
│   ├── Input.jsx       # Form input with validation
│   ├── Select.jsx      # Custom dropdown component
│   ├── Layout.jsx      # Main app layout with navigation
│   ├── GoogleAuthButton.jsx  # Google OAuth integration
│   └── ExpenseModal.jsx # Expense creation/editing modal
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Financial overview with charts
│   ├── Expenses.jsx    # Expense management page
│   ├── Budgets.jsx     # Budget setting and tracking
│   ├── Analytics.jsx   # Advanced analytics and insights
│   └── Settings.jsx    # App settings and preferences
├── utils/              # Utility functions
│   ├── storage.js      # Local storage management
│   ├── database.js     # Cloud database integration
│   └── dateHelpers.js  # Date manipulation utilities
├── context/            # React context providers
│   └── ThemeContext.jsx # Dark/light mode management
└── hooks/              # Custom React hooks (expandable)
```

## 🎨 Color Scheme

### Primary Colors (Orange)
- `primary-500`: #f97316 - Main orange
- `primary-600`: #ea580c - Darker orange
- `primary-700`: #c2410c - Deep orange

### Accent Colors (Green)
- `accent-500`: #22c55e - Main green
- `accent-600`: #16a34a - Darker green
- `accent-700`: #15803d - Deep green

### Luxury Colors
- `luxury-gold`: #fbbf24 - Premium gold accent
- `luxury-bronze`: #d97706 - Bronze highlights

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with glassmorphism effects
- **Mobile**: Collapsible sidebar with touch-friendly interactions
- **Tablets**: Adaptive layout that works on all screen sizes

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy Client ID to your `.env` file

### Neon Database Setup
1. Sign up at [Neon](https://neon.tech/)
2. Create a new database
3. Copy the connection string
4. Add to your `.env` file
5. Set up your API endpoints for CRUD operations

## 🚀 Deployment

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up Neon database integration

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Key Features in Detail

### Dashboard
- Real-time financial metrics
- Interactive expense charts
- Budget progress tracking
- Recent transactions view
- Month-over-month comparisons

### Expense Management
- Quick expense entry with categories
- Advanced search and filtering
- Bulk operations and editing
- Receipt notes and descriptions
- Indian currency formatting

### Budget Tracking
- Category-wise budget setting
- Visual progress indicators
- Overspending alerts
- Monthly/weekly budget cycles
- Budget vs actual comparisons

### Analytics
- Spending pattern analysis
- Category breakdown charts
- Monthly trend visualization
- Custom date range reports
- Export capabilities

## 💡 Technical Highlights

- **React 19** with modern hooks and patterns
- **Tailwind CSS** with custom premium design system
- **Framer Motion** for smooth animations
- **Recharts** for interactive data visualization
- **React Router** for seamless navigation
- **Date-fns** for robust date handling
- **Lucide React** for beautiful icons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

---

Built with ❤️ using React, Tailwind CSS, and modern web technologies.
