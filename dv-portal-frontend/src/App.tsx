import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Add all your admin accounts under each provider here:
const PAYMENT_POOLS: Record<string, string[]> = {
  'Telebirr': [
    '+251912345678', // Admin 1 Telebirr
    '+251987654321', // Admin 2 Telebirr
  ],
  'CBE Birr': [
    '1000987654321', // Admin 1 CBE
    '1000123456789', // Admin 2 CBE
  ],
};

const getRandomAccount = (provider: string) => {
  const accounts = PAYMENT_POOLS[provider] || [];
  if (accounts.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * accounts.length);
  return accounts[randomIndex];
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [step, setStep] = useState(1);

  // Track the selected provider and the randomly assigned account
  const [selectedProvider, setSelectedProvider] = useState('Telebirr');
  const [assignedAccount, setAssignedAccount] = useState(() => getRandomAccount('Telebirr'));

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    cityOfBirth: '',
    countryOfBirth: 'Ethiopia',
    email: '',
    phone: '',
    passportNumber: '',
    educationLevel: 'High School Degree (Grade 12 Passed)',
    maritalStatus: 'Unmarried',
    childrenCount: '0',
    promoCode: '',
    paymentChannel: '',
    transactionRef: '',
  });

  // Sync the combined provider + randomly assigned account into formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      paymentChannel: `${selectedProvider} - ${assignedAccount}`,
    }));
  }, [selectedProvider, assignedAccount]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('Copy Tracking ID');
  const [copyDvStatus, setCopyDvStatus] = useState('Copy Confirmation Code');
  const [copyAccountStatus, setCopyAccountStatus] = useState('Copy Account');

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  const isDark = theme === 'dark';

  const themeStyles = {
    bg: isDark ? '#070c18' : '#f8fafc',
    cardBg: isDark ? '#0b1329' : '#ffffff',
    headerBg: isDark ? '#020617' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#1e293b' : '#e2e8f0',
    inputBg: isDark ? '#070c18' : '#f1f5f9',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setSelectedProvider(newProvider);
    setAssignedAccount(getRandomAccount(newProvider));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any, setPreview?: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      if (setPreview) setPreview(URL.createObjectURL(file));
    }
  };

  const handleClearDraft = () => {
    const defaultProvider = 'Telebirr';
    const freshAccount = getRandomAccount(defaultProvider);
    setSelectedProvider(defaultProvider);
    setAssignedAccount(freshAccount);

    setFormData({
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      cityOfBirth: '',
      countryOfBirth: 'Ethiopia',
      email: '',
      phone: '',
      passportNumber: '',
      educationLevel: 'High School Degree (Grade 12 Passed)',
      maritalStatus: 'Unmarried',
      childrenCount: '0',
      promoCode: '',
      paymentChannel: `${defaultProvider} - ${freshAccount}`,
      transactionRef: '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setReceiptFile(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!photoFile) {
      setError('Please upload your passport photo in Step 2.');
      setStep(2);
      return;
    }

    if (!receiptFile) {
      setError('Please attach your payment receipt screenshot.');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      data.append('photo', photoFile);
      data.append('receipt', receiptFile);

      const res = await axios.post('http://localhost:5000/api/applications/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedTrackingId(res.data.trackingId || `DV-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err: any) {
      setSubmittedTrackingId(`DV-${Math.floor(1000000 + Math.random() * 9000000)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'tracking' | 'dv' | 'account' = 'tracking') => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    if (type === 'dv') {
      setCopyDvStatus('Copied!');
      setTimeout(() => setCopyDvStatus('Copy Confirmation Code'), 2500);
    } else if (type === 'account') {
      setCopyAccountStatus('Copied!');
      setTimeout(() => setCopyAccountStatus('Copy Account'), 2500);
    } else {
      setCopyStatus('Copied to Clipboard!');
      setTimeout(() => setCopyStatus('Copy Tracking ID'), 2500);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    if (searchId.toUpperCase() === 'DV-451029') {
      setSearchResult({
        id: 'DV-451029',
        status: 'Approved',
        dvConfirmationNumber: '20261OABC987654321',
        date: '2026-11-09',
      });
    } else if (searchId.toUpperCase() === 'DV-112044') {
      setSearchResult({
        id: 'DV-112044',
        status: 'Rejected',
        rejectionReason: 'Invalid transaction reference ID provided or receipt unreadable.',
        date: '2026-11-08',
      });
    } else {
      setSearchResult({
        id: searchId.toUpperCase(),
        status: 'Under Review',
        date: new Date().toLocaleDateString(),
      });
    }
  };

  const dynamicInputStyle = {
    width: '100%',
    backgroundColor: themeStyles.inputBg,
    border: `1px solid ${themeStyles.inputBorder}`,
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    color: themeStyles.text,
    fontSize: '0.95rem',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: themeStyles.bg, color: themeStyles.text, fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Mobile Responsiveness Stylesheet Injector */}
      <style>{`
        @media (max-width: 950px) {
          .responsive-main-grid {
            grid-template-columns: 1fr !important;
            padding: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .responsive-form-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Top Disclaimer Banner */}
      <div style={{ width: '100%', backgroundColor: isDark ? '#1e1b4b' : '#e0e7ff', color: isDark ? '#c7d2fe' : '#3730a3', padding: '0.65rem 1rem', textAlign: 'center', fontSize: '0.8rem', borderBottom: `1px solid ${themeStyles.border}`, fontWeight: '500', boxSizing: 'border-box' }}>
        📢 <strong>Notice:</strong> We are an independent administrative support service.
      </div>

      {/* Main Header */}
      <header style={{ borderBottom: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.headerBg, padding: '1.25rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: themeStyles.text, letterSpacing: '-0.5px' }}>
              Ethiopia DV 2026 Portal
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#60a5fa', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem', wordBreak: 'break-all' }}>
              ✈ Support Channel:{' '}
              <a href="https://t.me/ethdvassist" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                t.me/ethdvassist
              </a>
            </p>
          </div>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="responsive-main-grid" style={{ width: '100%', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start', boxSizing: 'border-box' }}>
        
        {/* Left Side: Form Section */}
        <div style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem', boxSizing: 'border-box' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              ● Draft saved automatically
            </span>
            <button onClick={handleClearDraft} style={{ background: 'none', border: 'none', color: themeStyles.subText, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
              Clear Draft
            </button>
          </div>

          <div className="responsive-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
            <button onClick={() => setStep(1)} style={{ padding: '0.85rem 0.5rem', borderRadius: '10px', border: 'none', backgroundColor: step === 1 ? '#f59e0b' : (isDark ? '#0f172a' : '#e2e8f0'), color: step === 1 ? '#000000' : themeStyles.subText, fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}>
              Step 1: Info
            </button>
            <button onClick={() => setStep(2)} style={{ padding: '0.85rem 0.5rem', borderRadius: '10px', border: 'none', backgroundColor: step === 2 ? '#f59e0b' : (isDark ? '#0f172a' : '#e2e8f0'), color: step === 2 ? '#000000' : themeStyles.subText, fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}>
              Step 2: Photo
            </button>
            <button onClick={() => setStep(3)} style={{ padding: '0.85rem 0.5rem', borderRadius: '10px', border: 'none', backgroundColor: step === 3 ? '#f59e0b' : (isDark ? '#0f172a' : '#e2e8f0'), color: step === 3 ? '#000000' : themeStyles.subText, fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}>
              Step 3: Payment
            </button>
          </div>

          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '14px', padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.875rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: themeStyles.text }}>
                    1. Personal Information (DS-5501 Specifications)
                  </h2>

                  <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Full Name (as in Passport) *</label>
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Gender *</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} style={dynamicInputStyle}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Date of Birth *</label>
                      <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>City of Birth *</label>
                      <input required type="text" name="cityOfBirth" value={formData.cityOfBirth} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Country of Birth *</label>
                      <input required type="text" name="countryOfBirth" value={formData.countryOfBirth} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Passport Number *</label>
                      <input required type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Highest Level of Education *</label>
                      <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} style={dynamicInputStyle}>
                        <option value="Primary School Only">Primary School Only</option>
                        <option value="High School, No Degree">High School, No Degree</option>
                        <option value="High School Degree (Grade 12 Passed)">High School Degree (Grade 12 Passed)</option>
                        <option value="Vocational School">Vocational School</option>
                        <option value="University Degree">University Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                      </select>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Marital Status *</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} style={dynamicInputStyle}>
                        <option value="Unmarried">Unmarried</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Number of Children *</label>
                      <input required type="number" min="0" name="childrenCount" value={formData.childrenCount} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: '#60a5fa', marginBottom: '0.5rem' }}>Promo Code (Optional)</label>
                      <input type="text" name="promoCode" value={formData.promoCode} onChange={handleInputChange} style={{ ...dynamicInputStyle, borderColor: '#3b82f6' }} />
                    </div>
                  </div>

                  <button type="button" onClick={() => setStep(2)} style={{ width: '100%', marginTop: '2rem', backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '0.9rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxSizing: 'border-box' }}>
                    Continue to Photo Upload (Step 2) →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: themeStyles.text }}>
                    2. Passport Photo Upload (600x600 px)
                  </h2>

                  <div style={{ border: `2px dashed ${themeStyles.border}`, borderRadius: '12px', padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: themeStyles.inputBg, position: 'relative', cursor: 'pointer', boxSizing: 'border-box' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhotoFile, setPhotoPreview)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    {photoPreview ? (
                      <div>
                        <img src={photoPreview} alt="Passport preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f59e0b', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>Photo attached successfully!</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                        <p style={{ fontWeight: '700', color: themeStyles.text, margin: '0 0 0.5rem', fontSize: '1rem' }}>Click to upload photo</p>
                        <p style={{ fontSize: '0.8rem', color: themeStyles.subText, margin: 0 }}>Must be JPEG, under 240KB, exactly <span style={{ color: '#f59e0b', fontWeight: '700' }}>600x600 pixels</span>.</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setStep(1)} style={{ backgroundColor: isDark ? '#0f172a' : '#e2e8f0', border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: '0.9rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button type="button" onClick={() => setStep(3)} style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: themeStyles.text }}>
                    3. Payment & Verification Upload
                  </h2>

                  <div style={{ display: 'grid', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Select Payment Method *</label>
                      <select value={selectedProvider} onChange={handleProviderChange} style={dynamicInputStyle}>
                        {Object.keys(PAYMENT_POOLS).map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned Random Account Display Box */}
                    <div style={{ backgroundColor: isDark ? '#0f172a' : '#fef3c7', border: `1px solid ${isDark ? '#1e293b' : '#fde68a'}`, padding: '1.15rem', borderRadius: '10px', boxSizing: 'border-box' }}>
                      <div style={{ fontSize: '0.85rem', color: isDark ? '#f59e0b' : '#92400e', fontWeight: '600', marginBottom: '0.75rem' }}>
                        💵 Fee Required: <span style={{ color: isDark ? '#ffffff' : '#78350f', fontWeight: '800' }}>500 ETB</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: themeStyles.inputBg, padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${themeStyles.border}` }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: themeStyles.subText }}>Assigned {selectedProvider} Account:</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '800', color: '#10b981', letterSpacing: '0.5px', userSelect: 'all' }}>
                            {assignedAccount}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(assignedAccount, 'account')}
                          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          {copyAccountStatus}
                        </button>
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Transaction Ref Number *</label>
                      <input required type="text" name="transactionRef" value={formData.transactionRef} onChange={handleInputChange} style={dynamicInputStyle} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: themeStyles.text, marginBottom: '0.5rem' }}>Attach Receipt Screenshot *</label>
                      <input required type="file" accept="image/*" onChange={(e) => handleFileChange(e, setReceiptFile)} style={{ ...dynamicInputStyle, padding: '0.5rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setStep(2)} style={{ backgroundColor: isDark ? '#0f172a' : '#e2e8f0', border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: '0.9rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      {submitting ? 'Submitting...' : 'Submit Final Application ✓'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Side: Status Lookup */}
        <div style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '14px', padding: '1.5rem', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: themeStyles.text, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔍 Check Status
            </h3>

            <form onSubmit={handleSearch} style={{ display: 'grid', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter App ID (e.g. DV-451029)"
                style={dynamicInputStyle}
              />
              <button type="submit" style={{ backgroundColor: isDark ? '#0f172a' : '#2563eb', border: `1px solid ${themeStyles.border}`, color: '#ffffff', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Lookup Application
              </button>
            </form>

            {searchResult && (
              <div style={{ marginTop: '1.25rem', backgroundColor: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, padding: '1rem', borderRadius: '10px', boxSizing: 'border-box', overflowWrap: 'break-word' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: '800' }}>{searchResult.id}</span>
                  <span style={{
                    backgroundColor: searchResult.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : searchResult.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: searchResult.status === 'Approved' ? '#10b981' : searchResult.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    {searchResult.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: themeStyles.subText, marginBottom: searchResult.dvConfirmationNumber || searchResult.rejectionReason ? '0.75rem' : '0' }}>Submitted: {searchResult.date}</div>
                
                {searchResult.status === 'Approved' && searchResult.dvConfirmationNumber && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Confirmation Number</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '800', color: '#10b981', letterSpacing: '1px', marginBottom: '0.6rem', wordBreak: 'break-all', userSelect: 'all' }}>
                      {searchResult.dvConfirmationNumber}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(searchResult.dvConfirmationNumber, 'dv')}
                      style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                    >
                      {copyDvStatus}
                    </button>
                  </div>
                )}

                {searchResult.status === 'Rejected' && searchResult.rejectionReason && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#ef4444', boxSizing: 'border-box' }}>
                    <strong>Reason for Rejection:</strong><br />
                    {searchResult.rejectionReason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {submittedTrackingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000, boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '16px', padding: '1.5rem', maxWidth: '460px', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: themeStyles.text, margin: '0 0 0.5rem' }}>Application Submitted!</h2>
            <p style={{ color: themeStyles.subText, fontSize: '0.85rem', margin: '0 0 1rem' }}>Copy your tracking ID to check your status later.</p>

            <div style={{ backgroundColor: themeStyles.inputBg, border: '1px dashed #f59e0b', padding: '1rem', borderRadius: '10px', fontFamily: 'monospace', fontSize: '1.3rem', color: '#f59e0b', fontWeight: '800', letterSpacing: '1px', marginBottom: '1rem', wordBreak: 'break-all', userSelect: 'all' }}>
              {submittedTrackingId}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => copyToClipboard(submittedTrackingId, 'tracking')}
                style={{ backgroundColor: '#f59e0b', color: '#000000', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
              >
                {copyStatus}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedTrackingId(null);
                  handleClearDraft();
                }}
                style={{ backgroundColor: isDark ? '#0f172a' : '#e2e8f0', border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close & Return to Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}