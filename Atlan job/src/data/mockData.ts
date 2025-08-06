import type { PredefinedQuery, QueryResult } from '../types';

// Sample datasets with different sizes for performance testing
export const SAMPLE_CUSTOMERS = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
  country: 'USA',
  registration_date: new Date(2020 + Math.floor(i / 200), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
  status: ['Active', 'Inactive', 'Pending'][i % 3],
  total_orders: Math.floor(Math.random() * 50),
  lifetime_value: Math.floor(Math.random() * 10000) + 100
}));

export const SAMPLE_ORDERS = Array.from({ length: 5000 }, (_, i) => ({
  order_id: `ORD-${String(i + 1).padStart(6, '0')}`,
  customer_id: Math.floor(Math.random() * 1000) + 1,
  product_name: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Tablet', 'Phone'][i % 7],
  quantity: Math.floor(Math.random() * 5) + 1,
  unit_price: Math.floor(Math.random() * 500) + 50,
  total_amount: 0, // Will be calculated
  order_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  status: ['Completed', 'Processing', 'Shipped', 'Cancelled'][i % 4],
  shipping_address: `${Math.floor(Math.random() * 9999) + 1} Main St, City ${i % 100}`
})).map(order => ({
  ...order,
  total_amount: order.quantity * order.unit_price
}));

export const SAMPLE_PRODUCTS = Array.from({ length: 200 }, (_, i) => ({
  product_id: `PROD-${String(i + 1).padStart(4, '0')}`,
  name: ['Laptop', 'Desktop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Tablet', 'Phone', 'Speaker', 'Camera'][i % 10],
  category: ['Electronics', 'Computers', 'Accessories', 'Mobile'][i % 4],
  price: Math.floor(Math.random() * 1000) + 50,
  stock_quantity: Math.floor(Math.random() * 100),
  supplier: `Supplier ${(i % 10) + 1}`,
  created_date: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  is_active: Math.random() > 0.1,
  rating: Math.round((Math.random() * 4 + 1) * 10) / 10
}));

export const LARGE_DATASET = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  transaction_id: `TXN-${String(i + 1).padStart(8, '0')}`,
  user_id: `USER-${Math.floor(Math.random() * 1000) + 1}`,
  amount: Math.round((Math.random() * 1000 + 10) * 100) / 100,
  currency: ['USD', 'EUR', 'GBP', 'JPY'][i % 4],
  type: ['Credit', 'Debit', 'Transfer'][i % 3],
  status: ['Success', 'Failed', 'Pending'][Math.floor(Math.random() * 3)],
  timestamp: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
  description: `Transaction ${i + 1} description`,
  merchant: `Merchant ${(i % 50) + 1}`,
  category: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities'][i % 5]
}));

export const PREDEFINED_QUERIES: PredefinedQuery[] = [
  {
    id: 'customers-basic',
    name: 'All Customers',
    description: 'Retrieve all customer information',
    category: 'Customers',
    query: `SELECT id, name, email, city, status, total_orders, lifetime_value
FROM customers
ORDER BY lifetime_value DESC
LIMIT 100;`
  },
  {
    id: 'customers-active',
    name: 'Active Customers',
    description: 'Get all active customers with high lifetime value',
    category: 'Customers',
    query: `SELECT name, email, city, lifetime_value, total_orders
FROM customers 
WHERE status = 'Active' AND lifetime_value > 5000
ORDER BY lifetime_value DESC;`
  },
  {
    id: 'orders-recent',
    name: 'Recent Orders',
    description: 'Show recent orders with customer details',
    category: 'Orders',
    query: `SELECT o.order_id, c.name as customer_name, o.product_name, 
       o.quantity, o.unit_price, o.total_amount, o.order_date, o.status
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= '2023-01-01'
ORDER BY o.order_date DESC
LIMIT 500;`
  },
  {
    id: 'products-inventory',
    name: 'Product Inventory',
    description: 'Current product inventory status',
    category: 'Products',
    query: `SELECT product_id, name, category, price, stock_quantity, 
       supplier, rating, is_active
FROM products
WHERE is_active = true
ORDER BY stock_quantity ASC;`
  },
  {
    id: 'sales-summary',
    name: 'Sales Summary',
    description: 'Monthly sales summary by product category',
    category: 'Analytics',
    query: `SELECT 
  EXTRACT(MONTH FROM order_date) as month,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE order_date >= '2023-01-01'
GROUP BY EXTRACT(MONTH FROM order_date)
ORDER BY month;`
  },
  {
    id: 'large-dataset',
    name: 'Large Transaction Dataset',
    description: 'Performance test with 10k+ rows',
    category: 'Performance',
    query: `SELECT transaction_id, user_id, amount, currency, type, 
       status, timestamp, merchant, category
FROM transactions
ORDER BY timestamp DESC;`
  }
];

// Mock data mapping for different queries
export const getMockDataForQuery = (queryId: string): QueryResult => {
  const baseResult = {
    id: queryId,
    query: PREDEFINED_QUERIES.find(q => q.id === queryId)?.query || '',
    executionTime: Math.floor(Math.random() * 200) + 50,
    timestamp: new Date().toISOString()
  };

  switch (queryId) {
    case 'customers-basic':
      return {
        ...baseResult,
        columns: ['id', 'name', 'email', 'city', 'status', 'total_orders', 'lifetime_value'],
        data: SAMPLE_CUSTOMERS.slice(0, 100),
        rowCount: 100
      };
    
    case 'customers-active': {
      const activeCustomers = SAMPLE_CUSTOMERS.filter(c => c.status === 'Active' && c.lifetime_value > 5000);
      return {
        ...baseResult,
        columns: ['name', 'email', 'city', 'lifetime_value', 'total_orders'],
        data: activeCustomers,
        rowCount: activeCustomers.length
      };
    }
    
    case 'orders-recent': {
      const recentOrders = SAMPLE_ORDERS.slice(0, 500).map(order => {
        const customer = SAMPLE_CUSTOMERS.find(c => c.id === order.customer_id);
        return {
          order_id: order.order_id,
          customer_name: customer?.name || 'Unknown',
          product_name: order.product_name,
          quantity: order.quantity,
          unit_price: order.unit_price,
          total_amount: order.total_amount,
          order_date: order.order_date,
          status: order.status
        };
      });
      return {
        ...baseResult,
        columns: ['order_id', 'customer_name', 'product_name', 'quantity', 'unit_price', 'total_amount', 'order_date', 'status'],
        data: recentOrders,
        rowCount: recentOrders.length
      };
    }
    
    case 'products-inventory': {
      const activeProducts = SAMPLE_PRODUCTS.filter(p => p.is_active);
      return {
        ...baseResult,
        columns: ['product_id', 'name', 'category', 'price', 'stock_quantity', 'supplier', 'rating', 'is_active'],
        data: activeProducts,
        rowCount: activeProducts.length
      };
    }
    
    case 'sales-summary': {
      const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total_orders: Math.floor(Math.random() * 500) + 100,
        total_revenue: Math.floor(Math.random() * 50000) + 10000,
        avg_order_value: Math.floor(Math.random() * 200) + 50
      }));
      return {
        ...baseResult,
        columns: ['month', 'total_orders', 'total_revenue', 'avg_order_value'],
        data: monthlySummary,
        rowCount: monthlySummary.length
      };
    }
    
    case 'large-dataset':
      return {
        ...baseResult,
        columns: ['transaction_id', 'user_id', 'amount', 'currency', 'type', 'status', 'timestamp', 'merchant', 'category'],
        data: LARGE_DATASET,
        rowCount: LARGE_DATASET.length,
        executionTime: Math.floor(Math.random() * 500) + 200
      };
    
    default:
      return {
        ...baseResult,
        columns: ['message'],
        data: [{ message: 'No data available for this query' }],
        rowCount: 1
      };
  }
};
