import React, { useState } from 'react';
import { Search, ChevronDown, Trash2, Edit3, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const usersData = [
  { id: 1, name: 'Eleanor Pena', roll: '#01', address: 'TA-107 Newyork', class: '01', dob: '02/05/2001', phone: '+123 6988567', avatar: 'https://picsum.photos/seed/eleanor/100/100' },
  { id: 2, name: 'Jessia Rose', roll: '#10', address: 'TA-107 Newyork', class: '02', dob: '03/04/2000', phone: '+123 8988569', avatar: 'https://picsum.photos/seed/jessia/100/100', selected: true },
  { id: 3, name: 'Jenny Wilson', roll: '#04', address: 'Australia, Sydney', class: '01', dob: '12/05/2001', phone: '+123 7988566', avatar: 'https://picsum.photos/seed/jenny/100/100' },
  { id: 4, name: 'Guy Hawkins', roll: '#03', address: 'Australia, Sydney', class: '02', dob: '03/05/2001', phone: '+123 5988565', avatar: 'https://picsum.photos/seed/guy/100/100' },
  { id: 5, name: 'Jacob Jones', roll: '#15', address: 'Australia, Sydney', class: '04', dob: '12/05/2001', phone: '+123 9988568', avatar: 'https://picsum.photos/seed/jacob/100/100' },
  { id: 6, name: 'Jacob Jones', roll: '#15', address: 'Australia, Sydney', class: '04', dob: '12/05/2001', phone: '+123 9988568', avatar: 'https://picsum.photos/seed/jacob2/100/100' },
  { id: 7, name: 'Jane Cooper', roll: '#01', address: 'Australia, Sydney', class: '04', dob: '12/03/2001', phone: '+123 6988566', avatar: 'https://picsum.photos/seed/jane/100/100' },
  { id: 8, name: 'Floyd Miles', roll: '#11', address: 'TA-107 Newyork', class: '01', dob: '03/05/2002', phone: '+123 5988569', avatar: 'https://picsum.photos/seed/floyd/100/100' },
  { id: 9, name: 'Floyd Miles', roll: '#11', address: 'TA-107 Newyork', class: '01', dob: '03/05/2002', phone: '+123 5988569', avatar: 'https://picsum.photos/seed/floyd2/100/100' },
];

export function Users() {
  const [users, setUsers] = useState(usersData);
  const [recordToDelete, setRecordToDelete] = useState<(typeof usersData)[0] | null>(null);
  const navigate = useNavigate();

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUsers(users.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleDeleteClick = (record: typeof usersData[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(record);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setUsers(users.filter(s => s.id !== recordToDelete.id));
      setRecordToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Users List</h1>
          <p className="text-gray-500 text-sm">Home <span className="mx-1">/</span> <span className="font-medium text-gray-700">Users</span></p>
        </div>
        <button className="bg-white border text-brand-primary border-brand-primary font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-secondary transition-colors">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Users Information</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search by name or roll"
                className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-primary">
                <Search className="w-4 h-4 opacity-70" />
              </span>
            </div>
            <button className="flex items-center gap-2 border border-gray-100 text-gray-600 bg-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              Last 30 days
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 font-medium text-gray-500 text-sm w-12">
                  <div className="w-5 h-5 border-2 rounded border-gray-300"></div>
                </th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">User Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Roll</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Address</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Class</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Date of Birth</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Phone</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => navigate(`/users/${student.id}/profile`)}
                  className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${student.selected ? 'bg-brand-primary/5' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div 
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${student.selected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}
                      onClick={(e) => toggleSelect(student.id, e)}
                    >
                      {student.selected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <span className="font-semibold text-gray-800 text-sm">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.roll}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.address}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.dob}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => handleDeleteClick(student, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/users/${student.id}/details`); }}
                        className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors rounded-md hover:bg-brand-secondary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1 mx-auto text-sm">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-primary bg-brand-primary text-white font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-medium">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-medium">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-medium">4</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-medium">5</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400"><MoreHorizontal className="w-4 h-4" /></span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-medium">100</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
             <button className="flex items-center gap-2 border border-gray-100 text-gray-600 bg-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              10 / page
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Trash2 className="w-5 h-5 text-brand-primary" />
              <h3 className="text-[17px] font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <div className="p-6">
              <p className="text-[15px] text-gray-800 leading-relaxed mb-6">
                Are you sure you want to delete the user record for 
                '{recordToDelete.name}' (Class {recordToDelete.class})? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setRecordToDelete(null)}
                className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
