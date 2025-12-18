"use client";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TrendingUp, Users, ShoppingCart, UserPlus, Activity, Bell, BadgeDollarSign, BarChart3, CheckCircle, AlertCircle, MapPin, Star, Droplets, Wrench, Zap, Wind, Leaf } from "lucide-react";
import CountUp from 'react-countup';

export default function DashboardPage() {
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

      {/* Three Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        {/* Customer Status Card */}
        <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col gap-2 transition min-h-[120px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-[#E31E24] text-white">
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

          <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border border-gray-200 dark:border-gray-700 rounded">
            <p>CUSTOMERS</p>
          </div>
        </div>

        {/* Technician Card */}
        <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col gap-2 transition min-h-[120px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-black text-white">
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
                Inactive: 4
              </span>
            </span>
          </div>

          <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border border-gray-200 dark:border-gray-700 rounded">
            <p>TECHNICIANS</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col gap-2 transition min-h-[120px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-[#E31E24] text-white">
              <BadgeDollarSign size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold">
                <CountUp end={120500} duration={2.5} separator="," prefix="₹" />
              </div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp size={12} /> +15% this month
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Sales: ₹120,500</span>
            <span>Orders: 8,210</span>
          </div>

          <div className="text-xs font-semibold text-gray-500 mt-2 text-center py-1 border border-gray-200 dark:border-gray-700 rounded">
            <p>REVENUE</p>
          </div>
        </div>
      </div>

      {/* Services Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-3 col-span-1 lg:col-span-2 min-h-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#E31E24] p-2 rounded-full text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-white">Services</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Activity size={12} className="text-[#E31E24]" /> 5 Services, 15 Sub-Services
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'AC Repair', count: 40, icon: <Wind className="text-[#E31E24]" size={28} /> },
              { name: 'Plumbing', count: 35, icon: <Droplets className="text-[#E31E24]" size={28} /> },
              { name: 'Electrical', count: 30, icon: <Zap className="text-[#E31E24]" size={28} /> },
              { name: 'Appliances', count: 25, icon: <Wrench className="text-[#E31E24]" size={28} /> },
              { name: 'Gardening', count: 20, icon: <Leaf className="text-[#E31E24]" size={28} /> },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-105 cursor-pointer"
              >
                <div className="mb-2">{cat.icon}</div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{cat.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.count} Sub-Services</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

      {/* Revenue by Services Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-[#E31E24]">
          <ShoppingCart size={16} /> Revenue By Services
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg overflow-hidden shadow border-separate border-spacing-y-1 text-sm">
            <thead className="bg-red-50 dark:bg-red-900/20">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Subservices</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Services</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                { subservice: 'AC Installation', service: 'Air Conditioning', revenue: '₹45,000' },
                { subservice: 'Pipe Leak Repair', service: 'Plumbing', revenue: '₹32,000' },
                { subservice: 'Wiring Upgrade', service: 'Electrical Services', revenue: '₹28,000' },
                { subservice: 'Fridge Repair', service: 'Appliance Services', revenue: '₹18,000' },
                { subservice: 'Lawn Maintenance', service: 'Gardening Service', revenue: '₹12,000' },
              ].map((row, idx) => (
                <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                  <td className="px-3 py-2 font-medium flex items-center gap-2">
                    <ShoppingCart size={12} className="text-[#E31E24]" /> {row.subservice}
                  </td>
                  <td className="px-3 py-2">{row.service}</td>
                  <td className="px-3 py-2 font-semibold text-green-600">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      {/* <div className="mt-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={20} /> Sales & User Analytics
          </h2>
          <span className="text-xs text-gray-400">(Chart Placeholder)</span>
        </div>
        <div className="h-48 flex items-center justify-center text-gray-400">[Chart will go here]</div>
      </div> */}

      {/* Chart Section - Dummy Bar Chart */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={20} /> Sales & User Analytics
          </h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#E31E24]"></div>
              Sales (₹)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-black"></div>
              Users
            </span>
          </div>
        </div>

        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="60"
                y1={50 + i * 40}
                x2="560"
                y2={50 + i * 40}
                stroke="#e5e7eb"
                strokeWidth="1"
                className="dark:stroke-gray-700"
              />
            ))}

            {/* Y-Axis Labels (Sales) */}
            {['₹100k', '₹75k', '₹50k', '₹25k', '₹0'].map((label, i) => (
              <text
                key={i}
                x="50"
                y={54 + i * 40}
                textAnchor="end"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {label}
              </text>
            ))}

            {/* Bars & Data */}
            {[
              { month: 'Jan', sales: 65000, users: 1200 },
              { month: 'Feb', sales: 78000, users: 1350 },
              { month: 'Mar', sales: 92000, users: 1480 },
              { month: 'Apr', sales: 85000, users: 1420 },
              { month: 'May', sales: 98000, users: 1600 },
              { month: 'Jun', sales: 105000, users: 1720 },
            ].map((data, i) => {
              const x = 100 + i * 75;
              const salesHeight = (data.sales / 120000) * 160;
              const usersHeight = (data.users / 2000) * 160;

              return (
                <g key={i}>
                  {/* Sales Bar */}
                  <rect
                    x={x}
                    y={210 - salesHeight}
                    width="30"
                    height={salesHeight}
                    fill="#E31E24"
                    rx="4"
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                  {/* Users Bar */}
                  <rect
                    x={x + 35}
                    y={210 - usersHeight}
                    width="30"
                    height={usersHeight}
                    fill="black"
                    rx="4"
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />

                  {/* Hover Tooltip */}
                  <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <rect
                      x={x - 25}
                      y={190 - salesHeight}
                      width="120"
                      height="45"
                      fill="white"
                      stroke="#E31E24"
                      rx="6"
                      className="shadow-lg"
                    />
                    <text x={x + 35} y={205 - salesHeight} className="text-xs font-semibold fill-[#E31E24]" textAnchor="middle">
                      ₹{data.sales.toLocaleString()}
                    </text>
                    <text x={x + 35} y={220 - salesHeight} className="text-xs fill-gray-600" textAnchor="middle">
                      {data.users} users
                    </text>
                  </g>

                  {/* X-Axis Label */}
                  <text
                    x={x + 32.5}
                    y="230"
                    textAnchor="middle"
                    className="text-xs fill-gray-700 dark:fill-gray-300 font-medium"
                  >
                    {data.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Last 6 Months Performance
        </div>
      </div>

      {/* Sales Analytics (Moved Here) */}
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

      {/* Top Technicians */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Top Technicians</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "Ahmed Khan",
            "Mohammed Ali",
            "Omar Farooq",
            "Yusuf Rahman",
            "Ibrahim Siddiqui",
            "Hassan Malik"
          ].map((name, i) => (
            <div key={i} className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-lg shadow p-4">
              <img
                src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                alt={name}
                className="w-12 h-12 rounded-full mb-2 border-2 border-[#E31E24]"
              />
              <span className="font-medium text-sm">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Transactions Table */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Latest Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Method</th>
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
                <tr key={idx} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 font-mono text-sm">{row.id}</td>
                  <td className="px-4 py-2 text-sm">{row.name}</td>
                  <td className="px-4 py-2 text-sm">{row.date}</td>
                  <td className="px-4 py-2 text-sm font-medium">{row.total}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${row.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        row.status === 'Refund' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications & Recent Signups (At the End) */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-[#E31E24]" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" /> Payment received from John Doe
            </li>
            <li className="flex items-center gap-2 text-sm">
              <AlertCircle size={16} className="text-red-500" /> Server CPU usage high
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" /> New user registered
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" /> Order #MB2540 completed
            </li>
          </ul>
        </div>

        {/* Recent Signups */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={20} className="text-black dark:text-white" />
            <h2 className="text-lg font-semibold">Recent Signups</h2>
          </div>
          <ul className="space-y-4">
            {[
              { name: 'Ahmed Khan', timeAgo: 0.5, avatar: 21 },
              { name: 'Sara Ali', timeAgo: 2, avatar: 22 },
              { name: 'Omar Farooq', timeAgo: 5, avatar: 23 },
              { name: 'Aisha Rahman', timeAgo: 8, avatar: 24 },
            ].map((user, i) => {
              const signupDate = new Date(Date.now() - user.timeAgo * 3600 * 1000);
              const formattedDate = signupDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = signupDate.toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <li key={i} className="flex items-center gap-3">
                  <img
                    src={`https://randomuser.me/api/portraits/men/${user.avatar}.jpg`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formattedDate}, {formattedTime}
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2.5 py-1 rounded-full font-medium">
                    New
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </ContentLayout>
  );
}