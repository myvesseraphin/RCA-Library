import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, type UserMutationPayload } from '../lib/api';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';
import { toDateInputValue } from '../lib/utils';

type UserFormData = UserMutationPayload;

function createEmptyFormData(): UserFormData {
  return {
    firstName: '',
    lastName: '',
    classLevel: '',
    section: '',
    roll: '',
    admissionDate: '',
    primaryPhone: '',
    primaryEmail: '',
    address: '',
  };
}

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const isCreateMode = !id;
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [studentId, setStudentId] = useState('');
  const [formData, setFormData] = useState<UserFormData>(createEmptyFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      setFormData(createEmptyFormData());
      setIsEditing(true);
      setStudentId('');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    api.getUser(id)
      .then((user) => {
        if (!active) {
          return;
        }

        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          classLevel: user.classLevel,
          section: user.section,
          roll: user.roll,
          admissionDate: toDateInputValue(user.admissionDate),
          primaryPhone: user.primaryPhone,
          primaryEmail: user.primaryEmail,
          address: user.address,
        });
        setStudentId(user.studentId);
        setIsEditing(false);
      })
      .catch((reason: unknown) => {
        toast.error(reason instanceof Error ? reason.message : 'Unable to load user details.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, isCreateMode, toast]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      if (isCreateMode) {
        const createdUser = await api.createUser(formData);
        await refresh();
        toast.success('User created successfully.');
        navigate(`/users/${createdUser.id}/details`, { replace: true });
        return;
      }

      const updatedUser = await api.updateUser(id, formData);
      await refresh();
      setFormData({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        classLevel: updatedUser.classLevel,
        section: updatedUser.section,
        roll: updatedUser.roll,
        admissionDate: toDateInputValue(updatedUser.admissionDate),
        primaryPhone: updatedUser.primaryPhone,
        primaryEmail: updatedUser.primaryEmail,
        address: updatedUser.address,
      });
      setStudentId(updatedUser.studentId);
      setIsEditing(false);
      toast.success('User details updated.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to save these details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || '-';

  return (
    <div className="page-shell">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Students Details</h1>
        <div className="flex items-center text-[13px]">
          <Link to="/users" className="text-gray-400 hover:text-gray-600">Students</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-800 font-medium">Students details</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-bold text-gray-900">About Me</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* About Me Card */}
          <div className="border border-gray-100 rounded-[10px] p-6">
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-gray-900">{fullName}</h3>
              <p className="text-[14px] text-gray-500 mt-1">Users</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
              <InfoItem label="First Name" value={formData.firstName} isEditing={isEditing} onChange={(val) => handleChange('firstName', val)} />
              <InfoItem label="Last Name" value={formData.lastName} isEditing={isEditing} onChange={(val) => handleChange('lastName', val)} />
              <InfoItem label="Class" value={formData.classLevel} isEditing={isEditing} onChange={(val) => handleChange('classLevel', val)} placeholder="Two" />
              <InfoItem label="Section" value={formData.section} isEditing={isEditing} onChange={(val) => handleChange('section', val)} placeholder="Red" />
              <InfoItem label="Roll" value={formData.roll} isEditing={isEditing} onChange={(val) => handleChange('roll', val)} placeholder="5648" />
              <InfoItem label="Admission Date" value={formData.admissionDate} isEditing={isEditing} onChange={(val) => handleChange('admissionDate', val)} placeholder="09-01-2021" type="date" />
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="border border-gray-100 rounded-[10px] p-6">
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-gray-900">Contact Information</h3>
              <p className="text-[14px] text-gray-500 mt-1">Users</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
              <InfoItem label="Primary Phone" value={formData.primaryPhone} isEditing={isEditing} onChange={(val) => handleChange('primaryPhone', val)} placeholder="(555) 123-4567" />
              <InfoItem label="Primary Email" value={formData.primaryEmail} isEditing={isEditing} onChange={(val) => handleChange('primaryEmail', val)} placeholder="jessia12@gmail.com" type="email" />
              <InfoItem label="Address" value={formData.address} isEditing={isEditing} onChange={(val) => handleChange('address', val)} placeholder="Springfield" />
              <InfoItem label="Student ID" value={studentId || 'Generated after save'} isEditing={false} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => {
              if (isEditing && !isCreateMode) setIsEditing(false);
              else if (isCreateMode) navigate('/users');
            }}
            className="px-6 py-2.5 text-[14px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Remove'}
          </button>
          
          <button 
            type="button"
            onClick={() => {
              if (!isEditing) setIsEditing(true);
              else void handleSubmit();
            }}
            disabled={isSaving}
            className="px-8 py-2.5 text-[14px] font-medium text-white bg-[#8B3DFF] rounded-lg hover:bg-[#7a34e0] transition-colors disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[13px] text-gray-400 mb-1.5">{label}</p>
      {isEditing ? (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-[90%] rounded-md border border-gray-200 px-3 py-1.5 text-[15px] font-medium text-gray-900 focus:border-[#8B3DFF] focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
        />
      ) : (
        <p className="text-[15px] font-medium text-gray-900 break-words pr-2">{value || placeholder}</p>
      )}
    </div>
  );
}
