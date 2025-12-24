import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Loader2, Shield, Eye, ShieldCheck, X } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { childAccountsService, calculateAgeYears } from '../../services/childAccounts';
import type {
  ChildNotificationPreferences,
  ChildPermissions,
  ChildRelationship,
  OversightLevel,
} from '../../services/childAccounts';
import { generateSecureChildPassword, scoreChildPassword } from '../../utils/childPassword';
import { triggerHaptic } from '../../utils/animations';

interface AddChildAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (generatedPassword?: string) => void;
}

const DEFAULT_PERMS: ChildPermissions = {
  view_family_documents: true,
  add_new_documents: true,
  edit_documents: false,
  delete_documents: false,
  share_documents_externally: false,
};

const DEFAULT_NOTIFS: ChildNotificationPreferences = {
  activity_summary: 'weekly',
  alert_on_delete: true,
  alert_on_share: true,
  alert_on_account_changes: true,
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function clampDobRange(dob: string) {
  // allow years 2007-2011 as requested
  if (!dob) return dob;
  const y = Number(dob.slice(0, 4));
  if (Number.isNaN(y)) return dob;
  if (y < 2007) return `2007${dob.slice(4)}`;
  if (y > 2011) return `2011${dob.slice(4)}`;
  return dob;
}

export default function AddChildAccountModal({ isOpen, onClose, onCreated }: AddChildAccountModalProps) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [relationship, setRelationship] = useState<ChildRelationship>('son');

  const [email, setEmail] = useState('');
  const [autoPassword, setAutoPassword] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [permissions, setPermissions] = useState<ChildPermissions>(DEFAULT_PERMS);
  const [oversightLevel, setOversightLevel] = useState<OversightLevel>('full_supervision');
  const [notificationPrefs, setNotificationPrefs] = useState<ChildNotificationPreferences>(DEFAULT_NOTIFS);
  const [legalConsent, setLegalConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const age = useMemo(() => (dob ? calculateAgeYears(dob) : null), [dob]);
  const ageValid = age !== null && age >= 13 && age <= 17;

  const strength = useMemo(() => scoreChildPassword(password), [password]);

  useEffect(() => {
    if (!isOpen) return;
    // reset when opening
    setFullName('');
    setDob('');
    setRelationship('son');
    setEmail('');
    setAutoPassword(true);
    setPassword('');
    setConfirmPassword('');
    setGeneratedPassword('');
    setPermissions(DEFAULT_PERMS);
    setOversightLevel('full_supervision');
    setNotificationPrefs(DEFAULT_NOTIFS);
    setLegalConsent(false);
    setIsSubmitting(false);
    setEmailAvailable(null);
    setEmailCheckLoading(false);
    setFormError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!autoPassword) return;
    const pw = generateSecureChildPassword(16);
    setGeneratedPassword(pw);
  }, [autoPassword, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!email || email.trim().length < 6 || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        setEmailCheckLoading(true);
        const res = await childAccountsService.checkEmailAvailable(email.trim());
        setEmailAvailable(res.available);
      } catch {
        // If the function isn't deployed yet, don't block creation (submit will catch duplicates).
        setEmailAvailable(null);
      } finally {
        setEmailCheckLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(handle);
  }, [email, isOpen]);

  const passwordMismatch = !autoPassword && password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    fullName.trim().length > 1 &&
    !!dob &&
    ageValid &&
    email.trim().length > 3 &&
    (emailAvailable !== false) &&
    legalConsent &&
    (!autoPassword
      ? password.length >= 8 && !passwordMismatch
      : generatedPassword.length >= 12);

  const handleSubmit = async () => {
    setFormError(null);
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const finalDob = clampDobRange(dob);
      const payload = {
        full_name: fullName.trim(),
        date_of_birth: finalDob,
        relationship,
        email: email.trim().toLowerCase(),
        auto_generate_password: autoPassword,
        password: autoPassword ? undefined : password,
        oversight_level: oversightLevel,
        permissions,
        notification_preferences: notificationPrefs,
        legal_consent: legalConsent,
      };

      const res = await childAccountsService.createChildAccount(payload);

      const pw = res.generated_password ?? (autoPassword ? generatedPassword : undefined);
      if (pw) {
        try {
          await navigator.clipboard.writeText(pw);
        } catch {
          // ignore
        }
      }

      triggerHaptic('heavy');
      onClose();
      onCreated(pw);
    } catch (e: any) {
      const msg = e?.message || 'Failed to create child account';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordMeter = () => {
    const value = autoPassword ? generatedPassword : password;
    if (!value) return null;
    const s = scoreChildPassword(value);
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/70">Strength</span>
          <span className="text-xs font-semibold" style={{ color: s.color }}>
            {s.label}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-2 rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
        </div>
      </div>
    );
  };

  const OversightCard = ({
    value,
    title,
    description,
    icon,
  }: {
    value: OversightLevel;
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    const selected = oversightLevel === value;
    return (
      <button
        type="button"
        onClick={() => setOversightLevel(value)}
        className="w-full text-left rounded-2xl p-4 transition-all"
        style={{
          background: selected ? 'rgba(139, 92, 246, 0.22)' : 'rgba(35, 29, 51, 0.55)',
          border: selected ? '1px solid rgba(139, 92, 246, 0.55)' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: selected ? '0 0 0 1px rgba(139, 92, 246, 0.25), 0 10px 30px rgba(0,0,0,0.35)' : undefined,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: selected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9))' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">{title}</h4>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  border: selected ? '2px solid #8B5CF6' : '2px solid rgba(255,255,255,0.25)',
                }}
              >
                {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#8B5CF6' }} />}
              </div>
            </div>
            <p className="text-sm text-white/70 mt-1">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Child Account"
      width={700}
      height={800}
      className=""
    >
      <div className="p-6">
        {formError && (
          <div
            className="mb-4 rounded-xl p-3 text-sm text-red-200"
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
            }}
          >
            {formError}
          </div>
        )}

        {/* Section 1 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Child&apos;s Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Child's full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-[52px]"
            />
            <div>
              <label className="block text-sm font-medium text-white mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                min="2007-01-01"
                max="2011-12-31"
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-[52px] px-4 rounded-xl text-white"
                style={{
                  background: 'rgba(35, 29, 51, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              />
              <div className="mt-2">
                <p className="text-xs" style={{ color: ageValid ? '#A78BFA' : '#FCA5A5' }}>
                  {age === null ? 'Age: —' : `Age: ${age} years old`}
                </p>
                {age !== null && !ageValid && (
                  <p className="text-xs mt-1 text-red-300">Child must be between 13 and 17 years old</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as ChildRelationship)}
                className="w-full h-[52px] px-4 rounded-xl text-white"
                style={{
                  background: 'rgba(35, 29, 51, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="dependent">Dependent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Account Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Email Address"
                placeholder="child@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[52px]"
              />
              <div className="mt-2 flex items-center gap-2">
                {emailCheckLoading && <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />}
                {emailAvailable === false && (
                  <span className="text-xs text-red-300">This email is already registered</span>
                )}
                {emailAvailable === true && (
                  <span className="text-xs text-green-300">Email available</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPassword}
                onChange={(e) => setAutoPassword(e.target.checked)}
              />
              Auto-generate secure password
            </label>
          </div>

          {autoPassword ? (
            <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(35, 29, 51, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Generated Password</p>
                  <p className="text-white font-mono break-all">{generatedPassword || '—'}</p>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={async () => {
                    if (!generatedPassword) return;
                    try {
                      await navigator.clipboard.writeText(generatedPassword);
                      triggerHaptic('light');
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
              <PasswordMeter />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[52px]"
                />
                <PasswordMeter />
                <div className="mt-2 text-xs text-white/60">
                  Password requirements: minimum 8 characters, uppercase, lowercase, number, special character
                </div>
              </div>
              <Input
                label="Confirm Password"
                placeholder="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-[52px]"
                error={passwordMismatch ? 'Passwords do not match' : undefined}
              />
              <div />
            </div>
          )}
        </div>

        {/* Section 3 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Initial Permissions</h3>
          <div className="space-y-3">
            {[
              { key: 'view_family_documents', label: 'View family documents', defaultOn: true },
              { key: 'add_new_documents', label: 'Add new documents', defaultOn: true },
              { key: 'edit_documents', label: 'Edit documents', defaultOn: false },
              { key: 'delete_documents', label: 'Delete documents', defaultOn: false },
              { key: 'share_documents_externally', label: 'Share documents externally', defaultOn: false },
            ].map((p) => {
              const k = p.key as keyof ChildPermissions;
              const checked = permissions[k];
              return (
                <div key={p.key} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(35, 29, 51, 0.55)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <span className="text-sm text-white">{p.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setPermissions((prev) => ({ ...prev, [k]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        position: 'relative',
                        background: checked ? '#8B5CF6' : 'rgba(255, 255, 255, 0.18)',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: checked ? 22 : 2,
                          width: 20,
                          height: 20,
                          borderRadius: 9999,
                          background: '#fff',
                          transition: 'left 160ms ease',
                        }}
                      />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Parental Oversight Level</h3>
          <div className="grid grid-cols-1 gap-3">
            <OversightCard
              value="full_supervision"
              title="Full Supervision"
              description="All actions require your approval"
              icon={<Shield className="w-5 h-5 text-white" />}
            />
            <OversightCard
              value="monitored_access"
              title="Monitored Access"
              description="Can use freely, you get activity reports"
              icon={<Eye className="w-5 h-5 text-white" />}
            />
            <OversightCard
              value="limited_independence"
              title="Limited Independence"
              description="Can manage own documents only"
              icon={<ShieldCheck className="w-5 h-5 text-white" />}
            />
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Parent Notifications</h3>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(35, 29, 51, 0.55)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white">Activity Summary</span>
              <select
                value={notificationPrefs.activity_summary}
                onChange={(e) => setNotificationPrefs((p) => ({ ...p, activity_summary: e.target.value as any }))}
                className="h-10 px-3 rounded-xl text-white"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {[
              { key: 'alert_on_delete', label: 'Alert me when child deletes documents' },
              { key: 'alert_on_share', label: 'Alert me when child shares documents' },
              { key: 'alert_on_account_changes', label: 'Alert me on account changes' },
            ].map((n) => {
              const k = n.key as keyof ChildNotificationPreferences;
              const checked = !!notificationPrefs[k];
              return (
                <label key={n.key} className="flex items-center gap-3 text-sm text-white/85 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setNotificationPrefs((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                  {n.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 6 */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Legal Consent</h3>
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(35, 29, 51, 0.55)',
              border: '1px solid rgba(139, 92, 246, 0.30)',
              boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.12)',
            }}
          >
            <label className="flex items-start gap-3 text-sm text-white/85 cursor-pointer">
              <input
                type="checkbox"
                checked={legalConsent}
                onChange={(e) => setLegalConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                I am the parent or legal guardian of this child and consent to create this supervised account. I have read and agree to the{' '}
                <a className="text-purple-300 underline" href="/privacy" target="_blank" rel="noreferrer">
                  Child Privacy Policy
                </a>{' '}
                and{' '}
                <a className="text-purple-300 underline" href="/terms" target="_blank" rel="noreferrer">
                  Terms for Minors
                </a>
                .
              </span>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? 'Creating...' : 'Create Child Account'}
          </Button>
        </div>

        {/* tiny close helper for power users */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="sr-only"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
    </DesktopModal>
  );
}


