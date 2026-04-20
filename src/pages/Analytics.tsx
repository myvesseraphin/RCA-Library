import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  FileDown, Download, Filter, TrendingUp, AlertTriangle, DollarSign, 
  BookOpen, Clock, Settings, UserCheck, Trash2, Calendar, ChevronDown,
  ArrowUpRight, ArrowDownRight, Layers, PieChart as PieIcon, Activity
} from 'lucide-react';

// Color Palette
const BRAND_PURPLE = '#7e22ce';
const BRAND_LILAC = '#c084fc';
const SUCCESS_GREEN = '#10b981';
const WARNING_AMBER = '#f59e0b';
const DANGER_RED = '#ef4444';
const INFO_BLUE = '#3b82f6';
const COLORS = [BRAND_PURPLE, INFO_BLUE, SUCCESS_GREEN, WARNING_AMBER, DANGER_RED, BRAND_LILAC];

// Mock Data
const overarchingActivity = [
  { name: 'Jan', borrows: 400, returns: 350, overdues: 30 },
  { name: 'Feb', borrows: 300, returns: 320, overdues: 25 },
  { name: 'Mar', borrows: 550, returns: 480, overdues: 45 },
  { name: 'Apr', borrows: 450, returns: 500, overdues: 35 },
  { name: 'May', borrows: 700, returns: 620, overdues: 55 },
  { name: 'Jun', borrows: 650, returns: 680, overdues: 40 },
  { name: 'Jul', borrows: 800, returns: 750, overdues: 60 },
  { name: 'Aug', borrows: 850, returns: 800, overdues: 65 },
  { name: 'Sep', borrows: 950, returns: 890, overdues: 80 },
];

const subjectRadarData = [
  { subject: 'Math', value: 120, fullMark: 150 },
  { subject: 'Science', value: 98, fullMark: 150 },
  { subject: 'History', value: 86, fullMark: 150 },
  { subject: 'Literature', value: 140, fullMark: 150 },
  { subject: 'Arts', value: 85, fullMark: 150 },
  { subject: 'Tech', value: 110, fullMark: 150 },
];

const circulationByGrade = [
  { name: 'Grade 9', fiction: 120, nonFiction: 80, academic: 40 },
  { name: 'Grade 10', fiction: 90, nonFiction: 100, academic: 60 },
  { name: 'Grade 11', fiction: 70, nonFiction: 60, academic: 110 },
  { name: 'Grade 12', fiction: 50, nonFiction: 50, academic: 150 },
];

const conditionData = [
  { name: 'Excellent', value: 3200 },
  { name: 'Good', value: 1200 },
  { name: 'Fair', value: 450 },
  { name: 'Poor', value: 150 },
  { name: 'Lost', value: 45 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Intelligence & Analytics</h1>
          <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Analytics</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              Year to Date
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

       {/* Navigation Tabs */}
       <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto custom-scrollbar">
        {[
          { id: 'executive', name: 'Executive Overview', icon: Activity },
          { id: 'demographics', name: 'Demographics & Grades', icon: UsersIcon },
          { id: 'inventory', name: 'Inventory Health', icon: Layers },
          { id: 'fines', name: 'Revenue & Fines', icon: DollarSign },
          { id: 'builder', name: 'Report Builder', icon: FileDown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-brand-primary/10 text-brand-primary' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Content Routing */}
      <div className="space-y-6">
        
        {/* ============================== */}
        {/* TAB 1: EXECUTIVE OVERVIEW      */}
        {/* ============================== */}
        {activeTab === 'executive' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Circulations" metric="24,592" trend="+12.5%" isPositive={true} icon={BookOpen} colorClass="text-brand-primary" bgClass="bg-purple-50" />
              <StatCard title="Overdue Rate" metric="4.2%" trend="-1.5%" isPositive={true} icon={AlertTriangle} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <StatCard title="Active Borrowers" metric="1,840" trend="+5.2%" isPositive={true} icon={UserCheck} colorClass="text-blue-600" bgClass="bg-blue-50" />
              <StatCard title="Fines Collected" metric="$1,240" trend="+22.0%" isPositive={true} icon={TrendingUp} colorClass="text-amber-600" bgClass="bg-amber-50" />
            </div>

            {/* Deep Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complex Composed Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Activity Flow</h2>
                    <p className="text-sm text-gray-500">Borrows vs Returns vs Overdues</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-primary"></div><span className="text-gray-600">Borrows</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-400"></div><span className="text-gray-600">Returns</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-gray-600">Overdues</span></div>
                  </div>
                </div>
                <div className="h-80 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={overarchingActivity} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="borrows" barSize={20} fill={BRAND_PURPLE} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="returns" barSize={20} fill="#60a5fa" radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="overdues" stroke={DANGER_RED} strokeWidth={3} dot={{r: 4, fill: DANGER_RED}} activeDot={{r: 6}} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart for Subject Popularity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Subject Affinity</h2>
                  <p className="text-sm text-gray-500">Category reach</p>
                </div>
                <div className="h-72 w-full mt-auto flex items-center justify-center -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectRadarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar name="Circulations" dataKey="value" stroke={BRAND_PURPLE} strokeWidth={2} fill={BRAND_PURPLE} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 2: DEMOGRAPHICS            */}
        {/* ============================== */}
        {activeTab === 'demographics' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Complex Stacked Bar */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Circulation by Grade Level</h2>
                <p className="text-sm text-gray-500 mb-6">Reading material preference segmentation</p>
                <div className="h-80 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={circulationByGrade} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar dataKey="fiction" name="Fiction" stackId="a" fill={BRAND_PURPLE} radius={[0, 0, 4, 4]} />
                      <Bar dataKey="nonFiction" name="Non-Fiction" stackId="a" fill={INFO_BLUE} />
                      <Bar dataKey="academic" name="Academic/Textbooks" stackId="a" fill={SUCCESS_GREEN} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboards */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Top 5 Student Readers</h2>
                <div className="flex-1 space-y-4">
                  {[
                    { name: 'Eleanor Pena', class: '12A', score: 142, avatar: 'https://picsum.photos/seed/eleanor/100' },
                    { name: 'Cody Fisher', class: '10B', score: 128, avatar: 'https://picsum.photos/seed/cody/100' },
                    { name: 'Esther Howard', class: '9C', score: 115, avatar: 'https://picsum.photos/seed/esther/100' },
                    { name: 'Jenny Wilson', class: '11B', score: 98, avatar: 'https://picsum.photos/seed/jenny/100' },
                    { name: 'Kristin Watson', class: '12C', score: 85, avatar: 'https://picsum.photos/seed/kristin/100' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-gray-300 w-6 text-center">{i + 1}</div>
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">Class {user.class}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-bold">
                        {user.score} Books
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 3: INVENTORY HEALTH        */}
        {/* ============================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Asset Condition Pie */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center h-[420px]">
                <div className="w-full text-left mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Total Asset Condition</h2>
                  <p className="text-sm text-gray-500">Distribution of 5,045 total physical books</p>
                </div>
                <div className="w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {conditionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 px-2">
                  {conditionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-xs font-semibold text-gray-600">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-Risk Assets Table */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Critical & At-Risk Assets</h2>
                    <p className="text-sm text-gray-500">Books requiring binding repair, replacement, or reported lost.</p>
                  </div>
                  <button className="text-sm text-brand-primary font-medium hover:underline">View All</button>
                </div>
                
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-4 py-3 font-semibold text-gray-700 rounded-l-lg">Book Title</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">ISBN / Copy ID</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Last Seen</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 rounded-r-lg text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { title: 'Advanced Calculus', id: 'MATH-0041', status: 'Lost', date: '12 Oct, 2023', type: 'bad' },
                        { title: 'World History Vol 2', id: 'HIST-0012', status: 'Poor (Spine Broken)', date: 'Returned 02 Nov', type: 'warn' },
                        { title: 'The Great Gatsby', id: 'LIT-0899', status: 'Missing Pages', date: 'Returned 14 Nov', type: 'warn' },
                        { title: 'Biology Foundations', id: 'SCI-0221', status: 'Lost', date: '01 Sep, 2023', type: 'bad' },
                        { title: 'Macbeth', id: 'LIT-0112', status: 'Water Damage', date: 'Returned 11 Nov', type: 'warn' },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-gray-900">{item.title}</td>
                          <td className="px-4 py-4 text-gray-500">{item.id}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              item.type === 'bad' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-500">{item.date}</td>
                          <td className="px-4 py-4 text-right">
                            <button className="text-gray-400 hover:text-brand-primary p-1.5"><Settings className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 4: REPORT BUILDER          */}
        {/* ============================== */}
        {activeTab === 'builder' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
              <div className="mb-8 p-6 bg-brand-primary/5 rounded-xl border border-brand-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-brand-primary mb-2">Custom Query Engine</h2>
                  <p className="text-sm text-gray-700 leading-relaxed max-w-lg">
                    Build complex data reports by stacking filters. Exports are available in highly formatted PDF dossiers or raw CSV data logic.
                  </p>
                </div>
                <div className="rounded-full bg-brand-primary/10 p-4 shrink-0">
                  <PieIcon className="w-10 h-10 text-brand-primary" />
                </div>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-brand-primary text-white font-bold text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-brand-primary/50 transition-colors">
                    <h3 className="font-bold text-gray-900 mb-4">Select Core Dataset</h3>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                      <option>Circulation History</option>
                      <option>Active Overdues & Fines</option>
                      <option>Inventory Roster</option>
                      <option>Student Activity Log</option>
                    </select>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-gray-200 text-gray-600 font-bold text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-brand-primary/50 transition-colors">
                    <h3 className="font-bold text-gray-900 mb-4">Apply Data Filters</h3>
                    <div className="space-y-3">
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                        <option>Filter by Grade: All</option>
                        <option>Grade 9</option>
                        <option>Grade 10</option>
                        <option>Grade 11</option>
                      </select>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                        <option>Filter by Subject: All</option>
                        <option>Mathematics</option>
                        <option>Literature</option>
                        <option>Sciences</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-gray-200 text-gray-600 font-bold text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-brand-primary/50 transition-colors">
                    <h3 className="font-bold text-gray-900 mb-4">Export Format</h3>
                    <div className="flex gap-3">
                      <button className="flex-1 flex flex-col items-center justify-center py-4 border-2 border-brand-primary bg-brand-primary/5 rounded-xl gap-2">
                        <FileDown className="w-6 h-6 text-brand-primary" />
                        <span className="font-bold text-brand-primary text-sm">PDF Report</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center justify-center py-4 border-2 border-gray-100 hover:border-gray-200 bg-white rounded-xl gap-2 transition-colors cursor-pointer">
                        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span className="font-bold text-gray-500 text-sm">CSV Data</span>
                      </button>
                    </div>
                    <button className="w-full mt-6 bg-brand-primary text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20">
                      <Download className="w-5 h-5" />
                      Generate & Download
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable mini stat card
function StatCard({ title, metric, trend, isPositive, icon: Icon, colorClass, bgClass }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{metric}</p>
      </div>
      
      {/* Decorative background element */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${bgClass.replace('50', '500')}`} />
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
