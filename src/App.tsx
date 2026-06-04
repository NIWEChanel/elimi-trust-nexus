import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { useMemo } from "react";

import { Toaster } from "@/components/ui/sonner";
import { LanguageGate } from "@/components/LanguageGate";
import { I18nProvider } from "@/lib/i18n";
import { Home } from "@/routes/index";
import { AboutPage } from "@/routes/about";
import { AdminLayout } from "@/routes/admin";
import { AdminCategories } from "@/routes/admin.categories";
import { AdminEmployees } from "@/routes/admin.employees";
import { AdminOverview } from "@/routes/admin.index";
import { AdminProducts } from "@/routes/admin.products";
import { EmployeeReportPage } from "@/routes/admin.report";
import { AdminReports } from "@/routes/admin.reports";
import { CategoriesPage } from "@/routes/categories";
import { ContactPage } from "@/routes/contact";
import { LoginPage } from "@/routes/login";
import { ProductDetail } from "@/routes/products.$id";
import { ProductsPage } from "@/routes/products";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground" href="/">
          Go home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LanguageGate />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="report" element={<EmployeeReportPage />} />
          </Route>
          <Route path="/admin/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster theme="dark" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
