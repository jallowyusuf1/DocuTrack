import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        full_name: user.user_metadata?.full_name || '',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: { full_name: string }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Update user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: data.full_name })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.full_name },
      });

      if (authError) throw authError;

      onSuccess();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            maxLength={100}
            {...register('full_name', {
              required: 'Full name is required',
              maxLength: { value: 100, message: 'Name must be less than 100 characters' },
            })}
            error={errors.full_name?.message as string | undefined}
            className="h-[52px]"
          />

          {/* Email (disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full h-[52px] px-4 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

