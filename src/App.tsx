import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/dashboard/pages/DashboardPage'
import Login from './pages/auth/pages/Login'
import RequireAuth from './middleware/RequireAuth'
import CategoryList from './pages/setup/category/pages/CategoryList'
import CategoryDetail from './pages/setup/category/pages/CategoryDetail'
import CategoryCreate from './pages/setup/category/pages/CategoryCreate'
import CategoryEdit from './pages/setup/category/pages/CategoryEdit'
import ManufacturerList from './pages/setup/manufacturer/pages/ManufacturerList'
import ManufacturerCreate from './pages/setup/manufacturer/pages/ManufacturerCreate'
import ManufacturerDetail from './pages/setup/manufacturer/pages/ManufacturerDetail'
import ManufacturerEdit from './pages/setup/manufacturer/pages/ManufacturerEdit'
import ProductList from './pages/setup/product/pages/ProductList'
import ProductDetail from './pages/setup/product/pages/ProductDetail'
import ProductEdit from './pages/setup/product/pages/ProductEdit'
import ProductCreate from './pages/setup/product/pages/ProductCreate'
import UnitList from './pages/setup/unit/pages/UnitList'
import UnitCreate from './pages/setup/unit/pages/UnitCreate'
import UnitDetail from './pages/setup/unit/pages/UnitDetail'
import UnitEdit from './pages/setup/unit/pages/UnitEdit'
import StockList from './pages/inventory/stock/pages/StockList'
import StockDetail from './pages/inventory/stock/pages/StockDetail'
import ProductConversionList from './pages/inventory/conversion/pages/ProductConversionList'
import ProductConversionDetail from './pages/inventory/conversion/pages/ProductConversionDetail'
import ConversionCreate from './pages/inventory/conversion/pages/ConversionCreate'
import ConversionDetail from './pages/inventory/conversion/pages/ConversionDetail'
import ConversionEdit from './pages/inventory/conversion/pages/ConversionEdit'
import PurchaseForm from './pages/transaction/purchase/pages/PurchaseForm'
import AdjustmentForm from './pages/transaction/adjustment/pages/AdjustmentForm'
import SaleForm from './pages/transaction/sale/pages/SaleForm'
import TransactionList from './pages/transaction/list/pages/TransactionList'
import SelectorTest from './examples/SelectorTest'
import SimpleSelectorTest from './examples/SimpleSelectorTest'
import PrinterSettings from './pages/setup/device/printer/pages/PrinterManager'

function App() {
  return (
    <Routes>
      {/* Auth Routes (without layout) */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (with layout and auth) */}
      <Route path="/*" element={
        <RequireAuth>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Test Routes */}
              <Route path="/test/selectors" element={<SelectorTest />} />
              <Route path="/test/simple-selectors" element={<SimpleSelectorTest />} />
              {/* Inventory Routes */}
              <Route path="/inventory/stock" element={<StockList />} />
              <Route path="/inventory/stock/:id" element={<StockDetail />} />
              <Route path="/inventory/conversion" element={<ProductConversionList />} />
              <Route path="/inventory/conversion/:id" element={<ProductConversionDetail />} />
              <Route path="/inventory/conversion/:productId/new" element={<ConversionCreate />} />
              <Route path="/inventory/conversion/:id/conversion/:conversionId" element={<ConversionDetail />} />
              <Route path="/inventory/conversion/:id/conversion/:conversionId/edit" element={<ConversionEdit />} />
              {/* Transaction Routes */}
              <Route path="/transaction/purchase" element={<PurchaseForm />} />
              <Route path="/transaction/adjustment" element={<AdjustmentForm />} />
              <Route path="/transaction/sale" element={<SaleForm />} />
              <Route path="/transaction/list" element={<TransactionList />} />
              {/* Setup Routes */}
              <Route path="/setup/user/list" element={<div className="p-6"><h1 className="text-2xl font-semibold text-gray-900">User List</h1><p className="text-gray-600 mt-2">Manage system users here.</p></div>} />
              <Route path="/setup/product/product" element={<div className="p-6"><h1 className="text-2xl font-semibold text-gray-900">Products</h1><p className="text-gray-600 mt-2">Manage products here.</p></div>} />
              <Route path="/setup/product/category" element={<CategoryList />} />
              <Route path="/setup/product/category/create" element={<CategoryCreate />} />
              <Route path="/setup/product/category/:id" element={<CategoryDetail />} />
              <Route path="/setup/product/category/:id/edit" element={<CategoryEdit />} />
              <Route path="/setup/product/manufacturer" element={<ManufacturerList />} />
              <Route path="/setup/product/manufacturer/create" element={<ManufacturerCreate />} />
              <Route path="/setup/product/manufacturer/:id" element={<ManufacturerDetail />} />
              <Route path="/setup/product/manufacturer/:id/edit" element={<ManufacturerEdit />} />
              <Route path="/setup/product/unit" element={<UnitList />} />
              <Route path="/setup/product/unit/create" element={<UnitCreate />} />
              <Route path="/setup/product/unit/:id" element={<UnitDetail />} />
              <Route path="/setup/product/unit/:id/edit" element={<UnitEdit />} />
              <Route path="/setup/product" element={<ProductList />} />
              <Route path="/setup/product/create" element={<ProductCreate />} />
              <Route path="/setup/product/:id" element={<ProductDetail />} />
              <Route path="/setup/product/:id/edit" element={<ProductEdit />} />
              <Route path="/setup/device/printer" element={<PrinterSettings />} />
            </Routes>
          </Layout>
        </RequireAuth>
      } />
    </Routes>
  )
}

export default App 