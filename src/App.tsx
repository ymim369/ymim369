/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, CreditCard, 
  Calendar, Filter, Download, Search, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { SaleRecord } from './types';
import { parseSalesCSV } from './utils/dataParser';
import { cn } from './lib/utils';

const INITIAL_CSV = `주문번호,상품명,가격(원),날짜,결제방식
TT-1001,Slim-Fit Denim Jeans,114400,2025-08-15 0:00:00,Credit Card
TT-1001,Technical Performance Joggers,97500,2025-08-15 0:00:00,Credit Card
TT-1002,Classic Fit Chinos,101400,2025-08-15 0:00:00,eWallet
TT-1003,Flannel-Lined Canvas Work Pants,127400,2025-08-16 0:00:00,Cash
TT-1004,Double-Pleated Khaki Trousers,106600,2025-08-16 0:00:00,Credit Card
TT-1005,Relaxed Fit Corduroy Trousers,110500,2025-08-17 0:00:00,Debit Card
TT-1005,Multi-Pocket Cargo Shorts,75400,2025-08-17 0:00:00,eWallet
TT-1006,Premium Tailored Trousers,227500,2025-08-18 0:00:00,Credit Card
TT-1007,Classic Denim Overalls,149500,2025-08-18 0:00:00,eWallet
TT-1008,Drawstring Linen Trousers,119600,2025-08-19 0:00:00,Debit Card
TT-1009,Slim-Fit Denim Jeans,114400,2025-08-19 0:00:00,Credit Card
TT-1009,Classic Fit Chinos,101400,2025-08-19 0:00:00,Cash
TT-1010,Tailored Wool Dress Trousers,188500,2025-08-20 0:00:00,Cash
TT-1011,Technical Performance Joggers,97500,2025-08-20 0:00:00,eWallet
TT-1012,Multi-Pocket Cargo Shorts,75400,2025-08-21 0:00:00,Cash
TT-1013,Striped Seersucker Trousers,123500,2025-08-21 0:00:00,Debit Card
TT-1014,Slim-Fit Denim Jeans,114400,2025-08-22 0:00:00,Debit Card
TT-1015,Flannel-Lined Canvas Work Pants,127400,2025-08-22 0:00:00,eWallet
TT-1015,Classic Fit Chinos,101400,2025-08-22 0:00:00,Debit Card
TT-1016,Drawstring Linen Trousers,119600,2025-08-23 0:00:00,Credit Card
TT-1017,Premium Tailored Trousers,227500,2025-08-24 0:00:00,Credit Card
TT-1018,Double-Pleated Khaki Trousers,106600,2025-08-24 0:00:00,Cash
TT-1018,Relaxed Fit Corduroy Trousers,110500,2025-08-24 0:00:00,Cash
TT-1019,Technical Performance Joggers,97500,2025-08-25 0:00:00,Debit Card
TT-1020,Classic Denim Overalls,149500,2025-08-25 0:00:00,Credit Card
TT-1021,Multi-Pocket Cargo Shorts,75400,2025-08-26 0:00:00,Credit Card
TT-1022,Classic Fit Chinos,101400,2025-08-26 0:00:00,Debit Card
TT-1023,Slim-Fit Denim Jeans,114400,2025-08-27 0:00:00,Debit Card
TT-1024,Tailored Wool Dress Trousers,188500,2025-08-27 0:00:00,eWallet
TT-1025,Flannel-Lined Canvas Work Pants,127400,2025-08-28 0:00:00,eWallet
TT-1025,Multi-Pocket Cargo Shorts,75400,2025-08-28 0:00:00,Debit Card
TT-1026,Drawstring Linen Trousers,119600,2025-08-29 0:00:00,Debit Card
TT-1027,Striped Seersucker Trousers,123500,2025-08-29 0:00:00,Credit Card
TT-1028,Relaxed Fit Corduroy Trousers,110500,2025-08-30 0:00:00,eWallet
TT-1029,Premium Tailored Trousers,227500,2025-08-30 0:00:00,Debit Card
TT-1029,Classic Fit Chinos,101400,2025-08-30 0:00:00,Debit Card
TT-1030,Technical Performance Joggers,97500,2025-08-31 0:00:00,Credit Card
TT-1031,Slim-Fit Denim Jeans,114400,2025-09-01 0:00:00,eWallet
TT-1032,Double-Pleated Khaki Trousers,106600,2025-09-01 0:00:00,Credit Card
TT-1033,Classic Denim Overalls,149500,2025-09-02 0:00:00,eWallet
TT-1034,Flannel-Lined Canvas Work Pants,127400,2025-09-02 0:00:00,Cash
TT-1034,Classic Fit Chinos,101400,2025-09-02 0:00:00,Cash
TT-1035,Multi-Pocket Cargo Shorts,75400,2025-09-03 0:00:00,Debit Card
TT-1036,Drawstring Linen Trousers,119600,2025-09-03 0:00:00,Credit Card
TT-1037,Tailored Wool Dress Trousers,188500,2025-09-04 0:00:00,Debit Card
TT-1038,Striped Seersucker Trousers,123500,2025-09-04 0:00:00,eWallet
TT-1039,Technical Performance Joggers,97500,2025-09-05 0:00:00,Cash
TT-1040,Slim-Fit Denim Jeans,114400,2025-09-05 0:00:00,Debit Card
TT-1040,Relaxed Fit Corduroy Trousers,110500,2025-09-05 0:00:00,eWallet
TT-1041,Classic Fit Chinos,101400,2025-09-06 0:00:00,Cash
TT-1042,Premium Tailored Trousers,227500,2025-09-06 0:00:00,Credit Card
TT-1043,Flannel-Lined Canvas Work Pants,127400,2025-09-07 0:00:00,Credit Card
TT-1044,Double-Pleated Khaki Trousers,106600,2025-09-08 0:00:00,Cash
TT-1045,Multi-Pocket Cargo Shorts,75400,2025-09-08 0:00:00,eWallet
TT-1046,Classic Denim Overalls,149500,2025-09-09 0:00:00,Cash
TT-1047,Tailored Wool Dress Trousers,188500,2025-09-09 0:00:00,eWallet
TT-1047,Classic Fit Chinos,101400,2025-09-09 0:00:00,Cash
TT-1048,Drawstring Linen Trousers,119600,2025-09-10 0:00:00,Credit Card
TT-1049,Slim-Fit Denim Jeans,114400,2025-09-10 0:00:00,Cash
TT-1050,Technical Performance Joggers,97500,2025-09-11 0:00:00,Debit Card
TT-1051,Striped Seersucker Trousers,123500,2025-09-12 0:00:00,Debit Card
TT-1052,Relaxed Fit Corduroy Trousers,110500,2025-09-12 0:00:00,eWallet
TT-1053,Premium Tailored Trousers,227500,2025-09-13 0:00:00,eWallet
TT-1054,Flannel-Lined Canvas Work Pants,127400,2025-09-13 0:00:00,Cash
TT-1054,Multi-Pocket Cargo Shorts,75400,2025-09-13 0:00:00,Credit Card
TT-1055,Double-Pleated Khaki Trousers,106600,2025-09-14 0:00:00,eWallet
TT-1056,Classic Fit Chinos,101400,2025-09-14 0:00:00,Debit Card
TT-1057,Slim-Fit Denim Jeans,114400,2025-09-15 0:00:00,eWallet
TT-1058,Classic Denim Overalls,149500,2025-09-16 0:00:00,Debit Card
TT-1059,Drawstring Linen Trousers,119600,2025-09-16 0:00:00,Debit Card
TT-1059,Technical Performance Joggers,97500,2025-09-16 0:00:00,Debit Card
TT-1060,Tailored Wool Dress Trousers,188500,2025-09-17 0:00:00,Cash
TT-1061,Striped Seersucker Trousers,123500,2025-09-17 0:00:00,Credit Card
TT-1062,Relaxed Fit Corduroy Trousers,110500,2025-09-18 0:00:00,eWallet
TT-1063,Premium Tailored Trousers,227500,2025-09-18 0:00:00,Credit Card
TT-1064,Slim-Fit Denim Jeans,114400,2025-09-19 0:00:00,Credit Card
TT-1065,Flannel-Lined Canvas Work Pants,127400,2025-09-19 0:00:00,eWallet
TT-1065,Classic Fit Chinos,101400,2025-09-19 0:00:00,eWallet
TT-1066,Double-Pleated Khaki Trousers,106600,2025-09-20 0:00:00,eWallet
TT-1067,Multi-Pocket Cargo Shorts,75400,2025-09-21 0:00:00,eWallet
TT-1068,Technical Performance Joggers,97500,2025-09-21 0:00:00,Credit Card
TT-1069,Classic Denim Overalls,149500,2025-09-22 0:00:00,eWallet
TT-1070,Drawstring Linen Trousers,119600,2025-09-22 0:00:00,Cash
TT-1071,Tailored Wool Dress Trousers,188500,2025-09-23 0:00:00,Credit Card
TT-1072,Slim-Fit Denim Jeans,114400,2025-09-23 0:00:00,eWallet
TT-1072,Striped Seersucker Trousers,123500,2025-09-23 0:00:00,eWallet
TT-1073,Relaxed Fit Corduroy Trousers,110500,2025-09-24 0:00:00,Credit Card
TT-1074,Classic Fit Chinos,101400,2025-09-24 0:00:00,Debit Card
TT-1075,Premium Tailored Trousers,227500,2025-09-25 0:00:00,Cash
TT-1076,Flannel-Lined Canvas Work Pants,127400,2025-09-26 0:00:00,Cash
TT-1077,Double-Pleated Khaki Trousers,106600,2025-09-26 0:00:00,Cash
TT-1078,Multi-Pocket Cargo Shorts,75400,2025-09-27 0:00:00,Cash
TT-1079,Technical Performance Joggers,97500,2025-09-27 0:00:00,Debit Card
TT-1079,Drawstring Linen Trousers,119600,2025-09-27 0:00:00,Cash
TT-1080,Classic Denim Overalls,149500,2025-09-28 0:00:00,Debit Card
TT-1081,Tailored Wool Dress Trousers,188500,2025-09-28 0:00:00,Cash
TT-1082,Slim-Fit Denim Jeans,114400,2025-09-29 0:00:00,Cash
TT-1083,Striped Seersucker Trousers,123500,2025-09-29 0:00:00,eWallet
TT-1084,Relaxed Fit Corduroy Trousers,110500,2025-09-30 0:00:00,eWallet
TT-1084,Classic Fit Chinos,101400,2025-09-30 0:00:00,Debit Card
TT-1085,Premium Tailored Trousers,227500,2025-10-01 0:00:00,Credit Card
TT-1086,Double-Pleated Khaki Trousers,106600,2025-10-01 0:00:00,Credit Card
TT-1087,Flannel-Lined Canvas Work Pants,127400,2025-10-02 0:00:00,eWallet
TT-1088,Technical Performance Joggers,97500,2025-10-02 0:00:00,Cash
TT-1089,Multi-Pocket Cargo Shorts,75400,2025-10-03 0:00:00,Credit Card
TT-1090,Drawstring Linen Trousers,119600,2025-10-03 0:00:00,Credit Card
TT-1091,Classic Denim Overalls,149500,2025-10-04 0:00:00,Cash
TT-1092,Tailored Wool Dress Trousers,188500,2025-10-04 0:00:00,Cash
TT-1092,Classic Fit Chinos,101400,2025-10-04 0:00:00,Debit Card
TT-1093,Slim-Fit Denim Jeans,114400,2025-10-05 0:00:00,Debit Card
TT-1094,Striped Seersucker Trousers,123500,2025-10-05 0:00:00,Cash
TT-1095,Relaxed Fit Corduroy Trousers,110500,2025-10-06 0:00:00,eWallet
TT-1096,Premium Tailored Trousers,227500,2025-10-06 0:00:00,Cash
TT-1097,Flannel-Lined Canvas Work Pants,127400,2025-10-07 0:00:00,Credit Card
TT-1097,Slim-Fit Denim Jeans,114400,2025-10-07 0:00:00,Debit Card
TT-1098,Double-Pleated Khaki Trousers,106600,2025-10-07 0:00:00,eWallet`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

export default function App() {
  const [data, setData] = useState<SaleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  useEffect(() => {
    const parsed = parseSalesCSV(INITIAL_CSV);
    setData(parsed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPayment = paymentFilter === 'All' || item.paymentMethod === paymentFilter;
      const matchesProduct = productFilter === 'All' || item.productName === productFilter;
      return matchesSearch && matchesPayment && matchesProduct;
    });
  }, [data, searchTerm, paymentFilter, productFilter]);

  const stats = useMemo(() => {
    const totalSales = filteredData.reduce((acc, curr) => acc + curr.price, 0);
    const totalOrders = new Set(filteredData.map(d => d.orderId)).size;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by Date
    const dateMap = new Map<string, number>();
    filteredData.forEach(item => {
      const dateStr = format(item.date, 'MM/dd');
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + item.price);
    });
    const salesByDate = Array.from(dateMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Sales by Product
    const productMap = new Map<string, number>();
    filteredData.forEach(item => {
      productMap.set(item.productName, (productMap.get(item.productName) || 0) + item.price);
    });
    const salesByProduct = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Sales by Payment
    const paymentMap = new Map<string, number>();
    filteredData.forEach(item => {
      paymentMap.set(item.paymentMethod, (paymentMap.get(item.paymentMethod) || 0) + 1);
    });
    const salesByPayment = Array.from(paymentMap.entries())
      .map(([name, value]) => ({ name, value }));

    return { totalSales, totalOrders, avgOrderValue, salesByDate, salesByProduct, salesByPayment };
  }, [filteredData]);

  const uniqueProducts = useMemo(() => ['All', ...new Set(data.map(d => d.productName))], [data]);
  const uniquePayments = useMemo(() => ['All', ...new Set(data.map(d => d.paymentMethod))], [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setData(parseSalesCSV(text));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time insights and performance metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Import CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total Revenue" 
            value={`₩${stats.totalSales.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            trend="+12.5%"
            trendUp={true}
          />
          <KPICard 
            title="Total Orders" 
            value={stats.totalOrders.toLocaleString()} 
            icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
            trend="+8.2%"
            trendUp={true}
          />
          <KPICard 
            title="Avg. Order Value" 
            value={`₩${Math.round(stats.avgOrderValue).toLocaleString()}`} 
            icon={<CreditCard className="w-5 h-5 text-amber-600" />}
            trend="-2.4%"
            trendUp={false}
          />
          <KPICard 
            title="Active Customers" 
            value="1,284" 
            icon={<Users className="w-5 h-5 text-purple-600" />}
            trend="+5.1%"
            trendUp={true}
          />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by product or order ID..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            {uniquePayments.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Revenue</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesByDate}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(value) => `₩${(value / 1000).toLocaleString()}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₩${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Payment Methods</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.salesByPayment}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.salesByPayment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Product Performance</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesByProduct} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 11}}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₩${value.toLocaleString()}`, 'Total Sales']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-bottom border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            <span className="text-sm text-slate-500">{filteredData.length} records found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredData.slice(0, 10).map((item, idx) => (
                    <motion.tr 
                      key={`${item.orderId}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{item.orderId}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{item.productName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{format(item.date, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          item.paymentMethod === 'Credit Card' ? "bg-blue-100 text-blue-700" :
                          item.paymentMethod === 'eWallet' ? "bg-emerald-100 text-emerald-700" :
                          item.paymentMethod === 'Cash' ? "bg-slate-100 text-slate-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ₩{item.price.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredData.length > 10 && (
            <div className="p-4 bg-slate-50 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View all transactions</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
        )}>
          {trendUp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">{value}</h2>
      </div>
    </motion.div>
  );
}
