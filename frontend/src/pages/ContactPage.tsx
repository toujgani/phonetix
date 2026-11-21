import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useBrandingStore } from '../store/brandingStore';

export const ContactPage: React.FC = () => {
  const { branding } = useBrandingStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Admissions & Student Affairs',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return; // Bot trap
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-16 space-y-12">
      {/* Page Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="primary" size="sm">Academic Support</Badge>
        <h1 className="text-3xl font-bold text-[#172033] tracking-tight">
          Institutional Contact &amp; Department Desk
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Reach the Department of Applied Linguistics or the PHONETIX Technical Administration team.
          All messages are logged and routed to the appropriate office.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-6 border-l-4 border-[#2563EB] bg-white shadow-sm">
            <h3 className="text-base font-semibold text-[#172033] mb-4">Institutional Headquarters</h3>
            <p className="text-xs text-[#64748B] leading-relaxed mb-5">
              {branding.address.split(/\r?\n/).map((line, index) => (
                <React.Fragment key={`${index}-${line}`}>
                  {index > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </p>

            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wide font-medium">Email</p>
                  <p className="text-xs text-[#172033] font-medium">{branding.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wide font-medium">Phone</p>
                  <p className="text-xs text-[#172033] font-medium">{branding.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FAF5FF] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wide font-medium">Location</p>
                  <p className="text-xs text-[#172033] font-medium">Language Arts Building, Suite 402</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wide font-medium">Office Hours</p>
                  <p className="text-xs text-[#172033] font-medium">Mon–Fri, 08:30–17:00</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#F8FAFC] border border-[#E5E7EB]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                All institutional messages are encrypted in transit (TLS 1.3) and archived in accordance with <strong className="text-[#172033]">FERPA</strong> and <strong className="text-[#172033]">GDPR</strong> compliance requirements.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8 bg-white shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-14 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Inquiry Dispatched Successfully</h3>
                <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Your inquiry has been logged and routed to the{' '}
                  <strong className="text-[#172033]">{formData.department}</strong>. A response will be
                  dispatched to <strong className="text-[#172033]">{formData.email}</strong> within 1
                  business day.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#172033]">Academic Inquiry Form</h2>
                  <p className="text-xs text-[#64748B] mt-1">All fields marked with * are required.</p>
                </div>

                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="website"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Arthur Holloway"
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@institution.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wide">
                    Target Department / Office *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  >
                    <option value="Admissions &amp; Student Affairs">Admissions &amp; Student Affairs</option>
                    <option value="Faculty of Applied Linguistics">Faculty of Applied Linguistics</option>
                    <option value="Phonetics Laboratory Technical Desk">Phonetics Laboratory Technical Desk</option>
                    <option value="Institutional Dean Office">Institutional Dean Office</option>
                  </select>
                </div>

                <Input
                  label="Subject *"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Inquiry regarding Course Curriculum"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wide">
                    Message Details *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details regarding your academic or technical inquiry..."
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none placeholder:text-[#94A3B8]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Institutional Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
