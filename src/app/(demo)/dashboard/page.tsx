"use client";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { DataTable } from "../../../components/tables/data-table";
import { TrendingUp, Users, ShoppingCart, UserPlus, Activity, Bell, BadgeDollarSign, BarChart3, CheckCircle, AlertCircle, MapPin, Star } from "lucide-react";
import CountUp from 'react-countup';

export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;
  return (
    <ContentLayout title="Dashboard">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" prefetch={false}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Premium Product Category Card at Top */}

      {/* Three Key Stats Cards Below - Compact & Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        {/* Customer Status Card */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-2 border-t-2 border-gradient-to-r from-[#f7971e] to-[#ffd200] hover:shadow-lg transition min-h-[120px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="p-2 rounded-full text-white"
                    style={{ background: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)" }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      <CountUp end={15200} duration={2.5} separator="," />
                    </div>
                    <div className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp size={12} /> +320 this month
                    </div>
                  </div>
                </div>

                {/* Active/Inactive */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                      Active: 12,000
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-500" />
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">
                      Inactive: 3,200
                    </span>
                  </span>
                </div>

                {/* Footer */}
                <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border-[1px] border-[#f0f0f0]">
                  <p>CUSTOMERS</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Customer Growth & Status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Technician Card */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-2 border-t-2 border-gradient-to-r from-[#43c6ac] to-[#f8ffae] hover:shadow-lg transition min-h-[120px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="p-2 rounded-full text-white"
                    style={{ background: "linear-gradient(90deg, #43c6ac 0%, #f8ffae 100%)" }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      <CountUp end={32} duration={2} />
                    </div>
                    <div className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp size={12} /> +2 this month
                    </div>
                  </div>
                </div>

                {/* Active/Inactive */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                      Active: 28
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-500" />
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">
                      InActive: 4
                    </span>
                  </span>
                </div>

                {/* Footer */}
                <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border-[1px] border-[#f0f0f0]">
                  <p>TECHNICIANS</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Technician Growth & Status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Revenue Card */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-2 border-t-2 border-gradient-to-r from-[#8000FF] to-[#DE00FF] hover:shadow-lg transition min-h-[120px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="p-2 rounded-full text-white"
                    style={{ background: "linear-gradient(90deg, #8000FF 0%, #DE00FF 100%)" }}
                  >
                    <BadgeDollarSign size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      <CountUp end={120500} duration={2.5} separator="," prefix="₹" />
                    </div>
                    <div className="text-xs text-green-500 flex that items-center gap-1">
                      <TrendingUp size={12} /> +15% this month
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sales: ₹120,500</span>
                  <span>Orders: 8,210</span>
                </div>
                {/* <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Margin: 33.6%</span>
                  <span>Orders: 8,210</span>
                </div> */}

                {/* Footer */}
                <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border-[1px] border-[#f0f0f0]">
                  <p>REVENUE</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Revenue, Sales & Order Summary</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Product Category Card - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-xl shadow-lg p-6 flex flex-col gap-3 col-span-1 lg:col-span-2 min-h-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white/20 p-2 rounded-full text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-white">Services</div>
              <div className="text-xs text-white/80 flex items-center gap-1"><Activity size={12} /> 8 Services, 22 Sub-Services, 120 Products</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <BarChart3 size={16} className="text-blue-200" />, name: 'Electronics', count: 40 },
              { icon: <BarChart3 size={16} className="text-pink-200" />, name: 'Fashion', count: 25 },
              { icon: <BarChart3 size={16} className="text-green-200" />, name: 'Home', count: 30 },
              { icon: <BarChart3 size={16} className="text-yellow-200" />, name: 'Sports', count: 25 },
            ].map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center bg-white/10 hover:bg-white/20 transition rounded p-2 shadow text-white">
                {cat.icon}
                <span className="font-medium mt-1 text-xs">{cat.name}</span>
                <span className="text-[10px] text-white/70">{cat.count} Products</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

      {/* Premium Table and List Sections - Compact */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue by Product Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-[#8000FF]"><ShoppingCart size={16} /> Revenue By Services</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg overflow-hidden shadow border-separate border-spacing-y-1 text-sm">
              <thead className="bg-gradient-to-r from-[#8000FF]/10 to-[#DE00FF]/10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Revenue</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'iPhone 15', category: 'Mobiles', revenue: '₹12,000', units: 120 },
                  { product: 'MacBook Pro', category: 'Laptops', revenue: '₹9,500', units: 45 },
                  { product: 'Galaxy S23', category: 'Mobiles', revenue: '₹7,800', units: 80 },
                  { product: 'Sony WH-1000XM5', category: 'Headphones', revenue: '₹3,200', units: 60 },
                ].map((row, idx) => (
                  <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-[#8000FF]/10 hover:to-[#DE00FF]/10 transition rounded shadow-sm">
                    <td className="px-3 py-2 font-medium flex items-center gap-2"><ShoppingCart size={12} className="text-[#8000FF]" /> {row.product}</td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2 font-semibold text-green-600">{row.revenue}</td>
                    <td className="px-3 py-2">{row.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Revenue by City Section */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-[#43c6ac]"><MapPin size={16} /> Revenue By Area</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg overflow-hidden shadow border-separate border-spacing-y-1 text-sm">
              <thead className="bg-gradient-to-r from-[#43c6ac]/10 to-[#f8ffae]/10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">City</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Revenue</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Orders</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { city: 'New York', revenue: '₹8,000', orders: 80 },
                  { city: 'San Francisco', revenue: '₹6,200', orders: 60 },
                  { city: 'London', revenue: '₹5,500', orders: 55 },
                  { city: 'Berlin', revenue: '₹4,100', orders: 40 },
                ].map((row, idx) => (
                  <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-[#43c6ac]/10 hover:to-[#f8ffae]/10 transition rounded shadow-sm">
                    <td className="px-3 py-2 font-medium flex items-center gap-2"><MapPin size={12} className="text-[#43c6ac]" /> {row.city}</td>
                    <td className="px-3 py-2 font-semibold text-green-600">{row.revenue}</td>
                    <td className="px-3 py-2">{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>

      {/* Divider */}
      {/* <div className="my-10 border-t border-gray-200 dark:border-gray-700" /> */}

      {/* Premium Members Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
        {/* Active Members */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-600"><CheckCircle size={20} /> Active Members</h3>
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-3 shadow hover:shadow-lg transition">
                <img src={`https://randomuser.me/api/portraits/men/${i + 30}.jpg`} alt="User" className="w-8 h-8 rounded-full border-2 border-green-400" />
                <span className="font-medium">Active User {i}</span>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
              </li>
            ))}
          </ul>
        </div> */}
        {/* Inactive Members */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600"><AlertCircle size={20} /> Inactive Members</h3>
          <ul className="space-y-3">
            {[1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-3 shadow hover:shadow-lg transition">
                <img src={`https://randomuser.me/api/portraits/men/${i + 40}.jpg`} alt="User" className="w-8 h-8 rounded-full border-2 border-red-400" />
                <span className="font-medium">Inactive User {i}</span>
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>
              </li>
            ))}
          </ul>
        </div> */}
      {/* </div> */}

      {/* Divider */}
      <div className="my-10 border-t border-gray-200 dark:border-gray-700" />

      {/* Chart Section (Placeholder) */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 size={20} /> Sales & User Analytics</h2>
          <span className="text-xs text-gray-400">(Chart Placeholder)</span>
        </div>
        <div className="h-48 flex items-center justify-center text-gray-400">[Chart will go here]</div>
      </div>

      {/* Notifications Widget */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-green-500" /> Payment received from John Doe</li>
            <li className="flex items-center gap-2 text-sm"><AlertCircle size={16} className="text-red-500" /> Server CPU usage high</li>
            <li className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-green-500" /> New user registered</li>
            <li className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-green-500" /> Order #MB2540 completed</li>
          </ul>
        </div>
        {/* Recent Signups */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">Recent Signups</h2>
          </div>
          <ul className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="User" className="w-8 h-8 rounded-full" />
                <div>
                  <span className="font-medium">User {i + 10}</span>
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">New</span>
                </div>
                <span className="ml-auto text-xs text-gray-400">{new Date(Date.now() - i * 3600 * 1000).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sales Analytics Section */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">Sales Analytics</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">Monthly</button>
            <button className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">Yearly</button>
            <button className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">Weekly</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm">Income</span>
            <span className="text-xl font-bold mt-1">₹2,371</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm">Sales</span>
            <span className="text-xl font-bold mt-1">258</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm">Conversion Ratio</span>
            <span className="text-xl font-bold mt-1">3.6%</span>
          </div>
        </div>
      </div>

      {/* Top Users Section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Top Technicians</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-lg shadow p-4">
              <img src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} alt="User" className="w-12 h-12 rounded-full mb-2" />
              <span className="font-medium">Technician {i}</span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Transactions Table */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Latest Transactions</h2>
        {/* Example DataTable usage with placeholder data */}
        {/* You can replace this with real columns/data */}
        {/* <DataTable columns={columns} data={data} /> */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Method</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'MB2540', name: 'Neal Matthews', date: '07 Oct, 2019', total: '₹400', status: 'Paid', method: 'Mastercard' },
                { id: 'MB2541', name: 'Jamal Burnett', date: '07 Oct, 2019', total: '₹380', status: 'Chargeback', method: 'Visa' },
                { id: 'MB2542', name: 'Juan Mitchell', date: '06 Oct, 2019', total: '₹384', status: 'Paid', method: 'Paypal' },
                { id: 'MB2543', name: 'Barry Dick', date: '05 Oct, 2019', total: '₹412', status: 'Paid', method: 'Mastercard' },
                { id: 'MB2544', name: 'Ronald Taylor', date: '04 Oct, 2019', total: '₹404', status: 'Refund', method: 'Visa' },
                { id: 'MB2545', name: 'Jacob Hunter', date: '04 Oct, 2019', total: '₹392', status: 'Paid', method: 'Paypal' },
              ].map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 font-mono">{row.id}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.total}</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2">{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </ContentLayout>
  );
}

