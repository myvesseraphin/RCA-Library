import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { PageLoader } from '../components/ui/PageLoader';
import { api, type UserMutationPayload } from '../lib/api';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';
import { toDateInputValue } from '../lib/utils';

function createEmptyFormData(): UserMutationPayload {
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

type UserFormData = UserMutationPayload;

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
        toast.success('Borrower created successfully.');
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
      toast.success('Borrower details updated.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to save this borrower.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Borrower';
  const canEdit = isCreateMode || isEditing;

  return (
    <div className="page-shell">
      <div className="mb-2">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{isCreateMode ? 'Create Borrower' : 'Borrower Details'}</h1>
        <p className="text-sm text-gray-500">
          {isCreateMode ? 'Add a new library borrower.' : 'View and edit the essential borrower profile fields.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="showcase-card px-8 py-6">
          <div className="mb-6 flex justify-between">
            <h2 className="text-[17px] font-bold text-gray-900">About Me</h2>
            {canEdit && (
              <button onClick={() => setIsEditing(false)} className="text-gray-400 font-bold tracking-widest leading-none">...</button>
            )}
          </div>
          
          <div className="mb-6 flex items-center gap-4">
            <InitialAvatar name={fullName} className="h-[52px] w-[52px] text-lg rounded-full" />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{fullName}</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Users</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7">
            <InfoItem label="First Name" value={formData.firstName} isEditing={isEditing} onChange={(value) => handleChange('firstName', value)} />
            <InfoItem label="Last Name" value={formData.lastName} isEditing={isEditing} onChange={(value) => handleChange('lastName', value)} />
            <InfoItem label="Class" value={formData.classLevel} isEditing={isEditing} onChange={(value) => handleChange('classLevel', value)} />
            <InfoItem label="Section" value={formData.section} isEditing={isEditing} onChange={(value) => handleChange('section', value)} />
            <InfoItem label="Roll" value={formData.roll} isEditing={isEditing} onChange={(value) => handleChange('roll', value)} />
            <InfoItem label="Admission Date" value={formData.admissionDate} isEditing={isEditing} onChange={(value) => handleChange('admissionDate', value)} type="date" />
          </div>
        </section>

        <section className="showcase-card px-8 py-6 flex flex-col">
          <div className="mb-6 flex justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Contact Information</h2>
              <p className="text-[13px] text-gray-500 mt-1">Users</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 mt-8">
            <InfoItem label="Primary Phone" value={formData.primaryPhone} isEditing={isEditing} onChange={(value) => handleChange('primaryPhone', value)} />
            <InfoItem label="Secondary Phone" value="" isEditing={isEditing} />
            <InfoItem label="Primary Email" value={formData.primaryEmail} isEditing={isEditing} onChange={(value) => handleChange('primaryEmail', value)} type="email" />
            <InfoItem label="Secondary Email" value="" isEditing={isEditing} />
            <InfoItem label="Address" value={formData.address} isEditing={isEditing} onChange={(value) => handleChange('address', value)} />
            <InfoItem label="Student ID" value={studentId || 'Generated after save'} isEditing={false} />
          </div>
          
          <div className="mt-auto pt-8 flex justify-end gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (isCreateMode) navigate('/users');
                  else setIsEditing(false);
                }}
                className="reference-secondary-button border border-gray-200 bg-white px-5 py-2 text-[14px] text-gray-600 rounded-lg"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="reference-secondary-button border border-gray-200 bg-white px-5 py-2 text-[14px] text-gray-600 rounded-lg"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isEditing && !isCreateMode) {
                  setIsEditing(true);
                  return;
                }
                void handleSubmit();
              }}
              disabled={isSaving}
              className="reference-primary-button !bg-[#7c2fd0] text-white px-6 py-2 text-[14px] rounded-lg disabled:opacity-75"
            >
              {isSaving ? 'Saving...' : isEditing ? (isCreateMode ? 'Create Borrower' : 'Save Changes') : 'Edit'}
            </button>
          </div>
        </section>
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
}: {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-[#998baf]">{label}</p>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full rounded border border-gray-200 px-2 py-1.5 text-[13px] font-semibold text-[#251f30] focus:border-[#7c2fd0] focus:outline-none"
        />
      ) : (
        <p className="flex items-center text-[13px] font-semibold text-[#251f30]">{value || '-'}</p>
      )}
    </div>
  );
}
