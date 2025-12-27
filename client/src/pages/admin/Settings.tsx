import { useState } from 'react';
import { Card } from '../../components/design-system/Card';
import { Button } from '../../components/design-system/Button';
import { Input } from '../../components/design-system/Input';
import { Save, Shield, Bell, Globe, Database } from 'lucide-react';

const SettingsPage = () => {
    // Mock settings state - in a real app this would come from a SettingsContext or API
    const [settings, setSettings] = useState({
        companyName: 'GearGuard Industries',
        maintenanceMode: false,
        emailNotifications: true,
        auditRetentionDays: 90,
        currency: 'USD',
        timeZone: 'UTC-5 (Eastern Time)'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">System Settings</h1>
                    <p className="text-[var(--color-text-secondary)]">Configure global application parameters.</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Save size={16} />}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* General Settings */}
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-600)]">
                        <Globe size={20} />
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">General Information</h2>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="Company Name"
                            value={settings.companyName}
                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Default Currency</label>
                                <select
                                    className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Time Zone</label>
                                <select
                                    className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-200)] bg-[var(--color-surface-0)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                                    value={settings.timeZone}
                                    onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                                >
                                    <option>UTC-5 (Eastern Time)</option>
                                    <option>UTC-8 (Pacific Time)</option>
                                    <option>UTC+0 (London)</option>
                                    <option>UTC+5:30 (India)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notifications & Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-600)]">
                            <Bell size={20} />
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 border border-[var(--color-border-200)] rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--color-surface-50)]">
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">Email Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                    className="accent-[var(--color-brand-600)] w-5 h-5"
                                />
                            </label>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                Receive email updates for high-priority maintenance requests.
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-600)]">
                            <Shield size={20} />
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 border border-[var(--color-border-200)] rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--color-surface-50)]">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Maintenance Mode</span>
                                    <span className="text-xs text-[var(--color-text-tertiary)]">Disable access for non-admins</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="accent-[var(--color-brand-600)] w-5 h-5"
                                />
                            </label>
                        </div>
                    </Card>
                </div>

                {/* Data Retention */}
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-600)]">
                        <Database size={20} />
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Data Governance</h2>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="Audit Log Retention (Days)"
                            type="number"
                            value={settings.auditRetentionDays}
                            onChange={(e) => setSettings({ ...settings, auditRetentionDays: Number(e.target.value) })}
                        />
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                            Logs older than this will be automatically archived.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
