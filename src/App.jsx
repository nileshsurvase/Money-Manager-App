import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import DiaryErrorBoundary from './components/DiaryErrorBoundary';
import Toast from './components/Toast';
import ToastProvider from './components/ToastProvider';


import { DashboardSkeleton, ExpenseListSkeleton, BudgetListSkeleton, AnalyticsSkeleton, FormSkeleton } from './components/SkeletonLoader';

// Lazy load Money Manager Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Lazy load My Diary Pages
const DiaryDashboard = lazy(() => import('./pages/diary/DiaryDashboard'));
const DailyJournal = lazy(() => import('./pages/diary/DailyJournal'));
const WeeklyJournal = lazy(() => import('./pages/diary/WeeklyJournal'));
const MonthlyJournal = lazy(() => import('./pages/diary/MonthlyJournal'));
const DiaryCalendar = lazy(() => import('./pages/diary/DiaryCalendar'));
const DiarySettings = lazy(() => import('./pages/diary/DiarySettings'));
const DiaryAnalytics = lazy(() => import('./pages/diary/DiaryAnalytics'));
const RecentEntries = lazy(() => import('./pages/diary/RecentEntries'));

// Lazy load CoreOS Pages
const CoreOSDashboard = lazy(() => import('./pages/coreos/CoreOSDashboard'));
const DailyTasks = lazy(() => import('./pages/coreos/DailyTasks'));
const FitnessTracker = lazy(() => import('./pages/coreos/FitnessTracker'));
const MentalReset = lazy(() => import('./pages/coreos/MentalReset'));
const CoreOSAnalytics = lazy(() => import('./pages/coreos/CoreOSAnalytics'));
const GoalIntegration = lazy(() => import('./pages/coreos/GoalIntegration'));
const GoalOS = lazy(() => import('./pages/coreos/GoalOS'));

// Lazy load FreedomOS Pages
const FreedomOSDashboard = lazy(() => import('./pages/freedomos/Dashboard'));
const BudgetingEngine = lazy(() => import('./pages/freedomos/BudgetingEngine'));
const EmergencyFundBuilder = lazy(() => import('./pages/freedomos/EmergencyFundBuilder'));
const LoanCrusher = lazy(() => import('./pages/freedomos/LoanCrusher'));
const WealthCreation = lazy(() => import('./pages/freedomos/WealthCreation'));
const GoalPlanning = lazy(() => import('./pages/freedomos/GoalPlanning'));
const InsuranceSuite = lazy(() => import('./pages/freedomos/InsuranceSuite'));
const RetirementLab = lazy(() => import('./pages/freedomos/RetirementLab'));
const TaxOptimization = lazy(() => import('./pages/freedomos/TaxOptimization'));
const NetWorthTracker = lazy(() => import('./pages/freedomos/NetWorthTracker'));
const AnnualWealthCheck = lazy(() => import('./pages/freedomos/AnnualWealthCheck'));

// App Router Component
const AppRouter = () => {
  return (
    <Layout>
      <Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          {/* Money Manager Routes (Default - Root paths) */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/money-manager" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/expenses" element={
            <Suspense fallback={<ExpenseListSkeleton />}>
              <Expenses />
            </Suspense>
          } />
          <Route path="/budgets" element={
            <Suspense fallback={<BudgetListSkeleton />}>
              <Budgets />
            </Suspense>
          } />
          <Route path="/analytics" element={
            <Suspense fallback={<AnalyticsSkeleton />}>
              <Analytics />
            </Suspense>
          } />

          {/* My Diary Routes - Always opens DiaryDashboard first */}
          <Route path="/diary" element={
            <DiaryErrorBoundary>
              <DiaryDashboard />
            </DiaryErrorBoundary>
          } />
          <Route path="/diary/dashboard" element={<Navigate to="/diary" replace />} />
          <Route path="/my-diary" element={<Navigate to="/diary" replace />} />
          <Route path="/calendar" element={<Navigate to="/diary/calendar" replace />} />
          <Route path="/diary/daily" element={
            <Suspense fallback={<FormSkeleton />}>
              <DailyJournal />
            </Suspense>
          } />
          <Route path="/diary/weekly" element={
            <Suspense fallback={<FormSkeleton />}>
              <WeeklyJournal />
            </Suspense>
          } />
          <Route path="/diary/monthly" element={
            <Suspense fallback={<FormSkeleton />}>
              <MonthlyJournal />
            </Suspense>
          } />
          <Route path="/diary/calendar" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <DiaryCalendar />
            </Suspense>
          } />
          <Route path="/diary/analytics" element={
            <Suspense fallback={<AnalyticsSkeleton />}>
              <DiaryAnalytics />
            </Suspense>
          } />
          <Route path="/diary/settings" element={
            <Suspense fallback={<FormSkeleton />}>
              <DiarySettings />
            </Suspense>
          } />
          <Route path="/diary/recent-entries" element={
            <Suspense fallback={<ExpenseListSkeleton />}>
              <RecentEntries />
            </Suspense>
          } />

          {/* CoreOS Routes - Always opens CoreOSDashboard first */}
          <Route path="/coreos" element={<CoreOSDashboard />} />
          <Route path="/coreos/dashboard" element={<Navigate to="/coreos" replace />} />
          <Route path="/coreos/tasks" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <DailyTasks />
            </Suspense>
          } />
          <Route path="/coreos/fitness" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <FitnessTracker />
            </Suspense>
          } />
          <Route path="/coreos/mental" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <MentalReset />
            </Suspense>
          } />
          <Route path="/coreos/analytics" element={
            <Suspense fallback={<AnalyticsSkeleton />}>
              <CoreOSAnalytics />
            </Suspense>
          } />
          <Route path="/coreos/goal-integration" element={
            <Suspense fallback={<FormSkeleton />}>
              <GoalIntegration />
            </Suspense>
          } />
          <Route path="/coreos/goalos" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <GoalOS />
            </Suspense>
          } />

          {/* FreedomOS Routes - Always opens FreedomOSDashboard first */}
          <Route path="/freedomos" element={
            <ErrorBoundary>
              <FreedomOSDashboard />
            </ErrorBoundary>
          } />
          <Route path="/freedomos/dashboard" element={<Navigate to="/freedomos" replace />} />
          <Route path="/freedom-os" element={<Navigate to="/freedomos" replace />} />
          <Route path="/freedomos/budgeting" element={
            <Suspense fallback={<FormSkeleton />}>
              <BudgetingEngine />
            </Suspense>
          } />
          <Route path="/freedomos/emergency-fund" element={
            <Suspense fallback={<FormSkeleton />}>
              <EmergencyFundBuilder />
            </Suspense>
          } />
          <Route path="/freedomos/insurance" element={
            <Suspense fallback={<FormSkeleton />}>
              <InsuranceSuite />
            </Suspense>
          } />
          <Route path="/freedomos/loans" element={
            <Suspense fallback={<FormSkeleton />}>
              <LoanCrusher />
            </Suspense>
          } />
          <Route path="/freedomos/retirement" element={
            <Suspense fallback={<FormSkeleton />}>
              <RetirementLab />
            </Suspense>
          } />
          <Route path="/freedomos/goals" element={
            <Suspense fallback={<FormSkeleton />}>
              <GoalPlanning />
            </Suspense>
          } />
          <Route path="/freedomos/wealth" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <WealthCreation />
            </Suspense>
          } />
          <Route path="/freedomos/net-worth" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <NetWorthTracker />
            </Suspense>
          } />
          <Route path="/freedomos/tax" element={
            <Suspense fallback={<FormSkeleton />}>
              <TaxOptimization />
            </Suspense>
          } />
          <Route path="/freedomos/annual-check" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <AnnualWealthCheck />
            </Suspense>
          } />

          {/* Settings Route (Available for all apps) */}
          <Route path="/settings" element={
            <Suspense fallback={<FormSkeleton />}>
              <Settings />
            </Suspense>
          } />

          {/* Catch-all route - redirect to Money Manager dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppProvider>
              <CurrencyProvider>
                <AppRouter />
                <Toast />
              </CurrencyProvider>
            </AppProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
