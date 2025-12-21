import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';
import { selectImageFromGallery, openCamera, compressImage, validateImage } from '../../utils/imageHandler';
import Avatar from '../ui/Avatar';

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
      // Reset avatar
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [isOpen, user, reset]);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    // Validate and compress
    const validation = await validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image');
    }
    
    const compressed = await compressImage(file, 400, 400, 0.9);
    const finalFile = compressed instanceof File 
      ? compressed 
      : new File([compressed], file.name, { type: 'image/jpeg' });
    
    // Upload to avatars bucket
    const fileName = `${user.id}/${Date.now()}_${finalFile.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, finalFile, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get signed URL for private bucket (secure access)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(data.path, 31536000); // 1 year expiry
    
    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error('Failed to generate secure avatar URL');
    }
    
    return signedUrlData.signedUrl;
  };

  const handleAvatarSelect = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploadingAvatar(true);
      const file = source === 'camera' 
        ? await openCamera()
        : await selectImageFromGallery();
      
      if (!file) return;
      
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    } catch (error: any) {
      alert(error.message || 'Failed to select image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: { full_name: string }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      let avatarUrl = user.user_metadata?.avatar_url;
      
      // Upload avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update user profile
      const updateData: any = { full_name: data.full_name };
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: data.full_name,
          avatar_url: avatarUrl,
        },
      });

      if (authError) throw authError;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="w-10 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar
                    src={avatarPreview || user?.user_metadata?.avatar_url}
                    fallback={user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    size="large"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      triggerHaptic('light');
                      // Show options
                      const useCamera = window.confirm('Take photo? (Cancel to choose from gallery)');
                      handleAvatarSelect(useCamera ? 'camera' : 'gallery');
                    }}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      border: '3px solid rgba(42, 38, 64, 0.85)',
                    }}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-center" style={{ color: '#A78BFA' }}>
                  Tap camera icon to change avatar
                </p>
              </div>

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
                <label className="block text-sm font-medium text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-[52px] px-4 rounded-xl text-white/50 cursor-not-allowed"
                  style={{
                    background: 'rgba(35, 29, 51, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                />
                <p className="mt-1 text-xs" style={{ color: '#A78BFA' }}>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
