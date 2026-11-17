import React, { useState } from 'react';
import {
  Palette,
  Upload,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Eye,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { useBrandingStore } from '../store/brandingStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { InstitutionalLogo } from '../components/ui/InstitutionalLogo';

export const AdminBrandingPage: React.FC = () => {
  const { branding, updateBranding, resetBranding } = useBrandingStore();

  const [form, setForm] = useState({
    platformName: branding.platformName,
    shortName: branding.shortName,
    institutionName: branding.institutionName,
    logoUrl: branding.logoUrl || '',
    faviconUrl: branding.faviconUrl || '',
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    contactEmail: branding.contactEmail,
    contactPhone: branding.contactPhone,
    address: branding.address,
    websiteUrl: branding.websiteUrl,
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(branding.logoUrl);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be smaller than 2MB.');
      return;
    }

    // Read as Data URL for immediate zero-latency preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewLogo(result);
      setForm((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateBranding({
      platformName: form.platformName,
      shortName: form.shortName,
      institutionName: form.institutionName,
      logoUrl: previewLogo || null,
      faviconUrl: form.faviconUrl || null,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      address: form.address,
      websiteUrl: form.websiteUrl,
    });

    setSaveNotice('Branding configuration successfully updated across the institutional platform!');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleResetToDefaults = () => {
    if (confirm('Revert all branding parameters to standard PHONETIX defaults?')) {
      resetBranding();
      setPreviewLogo(null);
      setForm({
        platformName: 'PHONETIX',
        shortName: 'PHONETIX LMS',
        institutionName: 'International Institute of Applied Linguistics',
        logoUrl: '',
        faviconUrl: '',
        primaryColor: '#2563EB',
        secondaryColor: '#1E293B',
        accentColor: '#7C3AED',
        contactEmail: 'admissions@institution.edu',
        contactPhone: '+1 (555) 019-4820',
        address: 'Faculty of Foreign Languages, Academic Avenue, Suite 400',
        websiteUrl: 'https://phonetix-institution.edu',
      });
      setSaveNotice('Branding reset to defaults.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="violet" size="sm">System Governance</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Branding & Institutional Identity
          </h1>
          <p className="text-xs text-slate-500">
            Configure institutional logo, color scheme, titles, and public contact information dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetToDefaults} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Main Grid: Form Settings + Live Preview Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Logo Management */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Institutional Logo & Crest
                </h3>
                <span className="text-xs text-slate-400">Supports PNG, JPG, transparent SVG (Max 2MB)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Logo Display Box */}
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-2 relative overflow-hidden shrink-0">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Uploaded Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-1">
                        θ
                      </div>
                      <span className="text-[10px] text-slate-400 block">Default Crest</span>
                    </div>
                  )}
                </div>

                {/* Upload & Remove Controls */}
                <div className="space-y-2 flex-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Upload New Institutional Crest
                  </label>
                  <p className="text-xs text-slate-500">
                    Your institutional logo will be applied to the navigation headers, student registration portal, login screen, and certificates.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <span className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-subtle transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Choose File
                      </span>
                    </label>

                    {previewLogo && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleRemoveLogo}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Platform Names & Identity */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Institution & Nomenclature
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Display Name *"
                  value={form.platformName}
                  onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  placeholder="e.g. PHONETIX"
                  required
                />
                <Input
                  label="Short Platform Subtitle *"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  placeholder="e.g. PHONETIX LMS"
                  required
                />
              </div>

              <Input
                label="Full Official Institution / University Name *"
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="e.g. International Institute of Applied Linguistics"
                required
              />
            </Card>

            {/* 3. Color Tokens */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Brand Palette Customization
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="w-full text-xs font-mono rounded border border-slate-300 px-2 py-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                      className="w-full text-xs font-mono rounded border border-slate-300 px-2 py-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="w-full text-xs font-mono rounded border border-slate-300 px-2 py-1.5"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Official Institutional Contact Details */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Institutional Contact & Registrar Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Support Email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Telephone Helpdesk"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Campus Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Official Institutional Website"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </Card>

            <Button type="submit" variant="primary" size="md">
              Save Branding Configuration
            </Button>
          </form>
        </div>

        {/* Live Preview Side Box */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-card sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live Header Preview
              </h3>
              <Badge variant="primary" size="sm">Realtime</Badge>
            </div>

            {/* Mock Header View */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Public Header Appearance</span>
              <div className="flex items-center justify-between py-2 px-3 border border-slate-100 rounded bg-slate-50">
                <div className="flex items-center gap-2">
                  {previewLogo ? (
                    <img src={previewLogo} alt="Logo" className="w-7 h-7 object-contain" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: form.primaryColor }}
                    >
                      θ
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-xs text-slate-900 block leading-none">
                      {form.platformName || 'PHONETIX'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium truncate block max-w-[120px]">
                      {form.institutionName || 'University'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-blue-600 font-semibold">Sign In</div>
              </div>
            </div>

            {/* Mock Login Preview */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Login Screen Branding</span>
              <div className="p-4 rounded border border-slate-100 bg-slate-50 text-center space-y-2">
                <div
                  className="w-8 h-8 rounded mx-auto flex items-center justify-center font-bold text-white text-xs"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  θ
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Sign In to {form.platformName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {form.institutionName}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-slate-600 leading-relaxed">
              <strong>Institutional Policy Note: </strong>Changes saved here update all student, teacher, and administrative layouts immediately without code recompilation.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
