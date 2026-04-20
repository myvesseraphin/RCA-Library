import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Jessia",
    lastName: "Rose",
    fatherName: "Steve Jones",
    motherName: "Naomi Rose",
    fatherOccupation: "Graphic Designer",
    motherOccupation: "House Wife",
    dob: "07-08-2015",
    religion: "Christian",
    classLevel: "Two",
    section: "Red",
    roll: "5648",
    admissionDate: "09-01-2021",
    primaryPhone: "(555) 123-4567",
    secondaryPhone: "(555) 987-6543",
    primaryEmail: "jessia12@gmail.com",
    secondaryEmail: "steve48@gmail.com",
    address: "Springfield",
    streetAddress: "Elm Street",
    houseName: "Meadowview",
    houseNumber: "62701",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAction = () => {
    if (isEditing) {
      setIsEditing(false); // Save state
    } else {
      setIsEditing(true); // Enter edit state
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Users Details</h1>
        <p className="text-gray-500 text-sm">Users <span className="mx-1">/</span> <span className="font-medium text-gray-700">Users details</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">About Me</h2>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Personal Info */}
          <div className="border border-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <img 
                  src={`https://picsum.photos/seed/user${id || 1}/100/100`} 
                  alt="User Profile" 
                  className="w-16 h-16 rounded-full object-cover border border-gray-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white translate-x-1 translate-y-1">
                  <span className="text-[10px]">📍</span>
                </div>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={formData.firstName} 
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-20 text-lg font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-brand-primary"
                    />
                    <input 
                      type="text" 
                      value={formData.lastName} 
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-20 text-lg font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                ) : (
                  <h3 className="text-lg font-bold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                )}
                <p className="text-gray-500 text-sm">Users</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="First Name" value={formData.firstName} isEditing={isEditing} onChange={(val) => handleChange('firstName', val)} />
              <InfoItem label="Last Name" value={formData.lastName} isEditing={isEditing} onChange={(val) => handleChange('lastName', val)} />
              <InfoItem label="Father Name" value={formData.fatherName} isEditing={isEditing} onChange={(val) => handleChange('fatherName', val)} />
              <InfoItem label="Mother Name" value={formData.motherName} isEditing={isEditing} onChange={(val) => handleChange('motherName', val)} />
              <InfoItem label="Father Occupation" value={formData.fatherOccupation} isEditing={isEditing} onChange={(val) => handleChange('fatherOccupation', val)} />
              <InfoItem label="Mother Occupation" value={formData.motherOccupation} isEditing={isEditing} onChange={(val) => handleChange('motherOccupation', val)} />
              <InfoItem label="Date of Birth" value={formData.dob} isEditing={isEditing} onChange={(val) => handleChange('dob', val)} />
              <InfoItem label="Religion" value={formData.religion} isEditing={isEditing} onChange={(val) => handleChange('religion', val)} />
              <InfoItem label="Class" value={formData.classLevel} isEditing={isEditing} onChange={(val) => handleChange('classLevel', val)} />
              <InfoItem label="Section" value={formData.section} isEditing={isEditing} onChange={(val) => handleChange('section', val)} />
              <InfoItem label="Roll" value={formData.roll} isEditing={isEditing} onChange={(val) => handleChange('roll', val)} />
              <InfoItem label="Admission Date" value={formData.admissionDate} isEditing={isEditing} onChange={(val) => handleChange('admissionDate', val)} />
            </div>
          </div>

          {/* Right Panel: Contact Info */}
          <div className="border border-gray-100 rounded-xl p-6">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              <p className="text-gray-500 text-sm">Users</p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Primary Phone" value={formData.primaryPhone} isEditing={isEditing} onChange={(val) => handleChange('primaryPhone', val)} />
              <InfoItem label="Secondary Phone" value={formData.secondaryPhone} isEditing={isEditing} onChange={(val) => handleChange('secondaryPhone', val)} />
              <InfoItem label="Primary Email" value={formData.primaryEmail} isEditing={isEditing} onChange={(val) => handleChange('primaryEmail', val)} />
              <InfoItem label="Secondary Email" value={formData.secondaryEmail} isEditing={isEditing} onChange={(val) => handleChange('secondaryEmail', val)} />
              <InfoItem label="Address" value={formData.address} isEditing={isEditing} onChange={(val) => handleChange('address', val)} />
              <InfoItem label="Street Address" value={formData.streetAddress} isEditing={isEditing} onChange={(val) => handleChange('streetAddress', val)} />
              <InfoItem label="House Name" value={formData.houseName} isEditing={isEditing} onChange={(val) => handleChange('houseName', val)} />
              <InfoItem label="House Number" value={formData.houseNumber} isEditing={isEditing} onChange={(val) => handleChange('houseNumber', val)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {isEditing && (
            <button 
              onClick={() => setIsEditing(false)}
              className="px-8 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {!isEditing && (
            <button 
              onClick={() => navigate('/users')}
              className="px-8 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={handleAction}
            className="px-8 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20"
          >
            {isEditing ? 'Save Changes' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, isEditing, onChange }: { label: string, value: string, isEditing?: boolean, onChange?: (val: string) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      {isEditing ? (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)} 
          className="w-full text-sm font-semibold text-gray-800 bg-gray-50/50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
        />
      ) : (
        <p className="text-sm font-semibold text-gray-800 h-[34px] flex items-center">{value}</p>
      )}
    </div>
  );
}
