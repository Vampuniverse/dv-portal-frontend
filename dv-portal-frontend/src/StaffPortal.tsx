import React, { useState } from 'react';

type Role = 'SUPERADMIN' | 'STAFF_MANAGER' | 'VERIFIER' | 'PROMO_VIEWER';

interface StaffUser {
  username: string;
  password?: string;
  role: Role;
  name: string;
}

interface Application {
  id: string;
  name: string;
  passport: string;
  phone: string;
  email: string;
  dob: string;
  cityOfBirth: string;
  education: string;
  maritalStatus: string;
  children: string;
  promoCode: string;
  paymentChannel: string;
  refNo: string;
  status: 'Under Review' | 'Approved' | 'Rejected';
  dvConfirmationNumber?: string;
  rejectionReason?: string;
  date: string;
}

interface PaymentChannelItem {
  id: string;
  name: string;
  account: string;
}

export default function StaffPortal() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<StaffUser | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [adminPassword, setAdminPassword] = useState('super123');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState('');

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Approval Modal State (DV Confirmation Number Prompt)
  const [approvingAppId, setApprovingAppId] = useState<string | null>(null);
  const [dvCodeInput, setDvCodeInput] = useState('');

  // Rejection Modal State
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

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

  const dynamicInputStyle = {
    width: '100%',
    backgroundColor: themeStyles.inputBg,
    border: `1px solid ${themeStyles.inputBorder}`,
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    color: themeStyles.text,
    fontSize: '0.9rem',
    boxSizing: 'border-box' as const,
  };

  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelItem[]>([
    { id: '1', name: 'Telebirr', account: '+251912345678' },
    { id: '2', name: 'CBE Birr', account: '1000987654321' },
    { id: '3', name: 'Bank of Abyssinia', account: '87654321' },
  ]);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelAccount, setNewChannelAccount] = useState('');

  const [activeTab, setActiveTab] = useState<'applications' | 'promo_analytics' | 'staff_management' | 'payment_settings' | 'security'>('applications');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Under Review' | 'Approved' | 'Rejected'>('ALL');

  const [staffList, setStaffList] = useState<StaffUser[]>([
    { username: 'manager', password: 'manager123', role: 'STAFF_MANAGER', name: 'Operations Staff Manager' },
    { username: 'verifier', password: 'staff123', role: 'VERIFIER', name: 'Standard Verifier' },
    { username: 'promoviewer', password: 'promo123', role: 'PROMO_VIEWER', name: 'Promo Analytics Viewer' },
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role>('VERIFIER');

  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'DV-982301',
      name: 'Abebe Bikila',
      passport: 'EP1234567',
      phone: '+251911223344',
      email: 'abebe@example.com',
      dob: '1998-05-12',
      cityOfBirth: 'Addis Ababa',
      education: 'High School Degree (Grade 12 Passed)',
      maritalStatus: 'Unmarried',
      children: '0',
      promoCode: 'DISCOUNT2026',
      paymentChannel: 'Telebirr',
      refNo: 'TX198230491',
      status: 'Under Review',
      date: '2026-11-10',
    },
    {
      id: 'DV-451029',
      name: 'Tigist Assefa',
      passport: 'EP7654321',
      phone: '+251922334455',
      email: 'tigist@example.com',
      dob: '1996-08-24',
      cityOfBirth: 'Hawassa',
      education: 'University Degree',
      maritalStatus: 'Married',
      children: '1',
      promoCode: 'DISCOUNT2026',
      paymentChannel: 'CBE Birr',
      refNo: 'CBE99823411',
      status: 'Approved',
      dvConfirmationNumber: '20261OABC987654321',
      date: '2026-11-09',
    },
    {
      id: 'DV-112044',
      name: 'Dawit Yohannes',
      passport: 'EP9988776',
      phone: '+251933445566',
      email: 'dawit@example.com',
      dob: '2001-01-15',
      cityOfBirth: 'Adama',
      education: 'High School, No Degree',
      maritalStatus: 'Unmarried',
      children: '0',
      promoCode: 'ETHIOVIP',
      paymentChannel: 'Telebirr',
      refNo: 'TX882736190',
      status: 'Rejected',
      rejectionReason: 'Invalid transaction reference ID provided or receipt unreadable.',
      date: '2026-11-08',
    },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (usernameInput === 'superadmin' && passwordInput === adminPassword) {
      setUser({ username: 'superadmin', role: 'SUPERADMIN', name: 'Master System Admin' });
      return;
    }

    const foundStaff = staffList.find(s => s.username === usernameInput && s.password === passwordInput);
    if (foundStaff) {
      setUser(foundStaff);
    } else {
      setLoginError('Invalid Username or Password');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingAppId || !dvCodeInput.trim()) return;

    setApplications(apps =>
      apps.map(app => app.id === approvingAppId ? {
        ...app,
        status: 'Approved',
        dvConfirmationNumber: dvCodeInput.trim(),
        rejectionReason: undefined
      } : app)
    );

    setApprovingAppId(null);
    setDvCodeInput('');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId || !rejectionReasonInput.trim()) return;

    setApplications(apps =>
      apps.map(app => app.id === rejectingAppId ? {
        ...app,
        status: 'Rejected',
        rejectionReason: rejectionReasonInput,
        dvConfirmationNumber: undefined
      } : app)
    );

    setRejectingAppId(null);
    setRejectionReasonInput('');
  };

  const deleteApplication = (id: string) => {
    if (confirm(`Superadmin Action: Are you sure you want to permanently delete record ${id}?`)) {
      setApplications(apps => apps.filter(app => app.id !== id));
    }
  };

  const addStaffAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUser.trim() || !newStaffPassword.trim()) return;

    if (newStaffRole === 'SUPERADMIN') {
      alert('Permission Denied: Only one Superadmin is permitted in the system.');
      return;
    }

    setStaffList([
      ...staffList,
      { username: newStaffUser.toLowerCase(), password: newStaffPassword, role: newStaffRole, name: newStaffName }
    ]);
    setNewStaffName('');
    setNewStaffUser('');
    setNewStaffPassword('');
  };

  const removeStaffAccount = (username: string) => {
    setStaffList(list => list.filter(s => s.username !== username));
  };

  const handleAddPaymentChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !newChannelAccount.trim()) return;
    setPaymentChannels([
      ...paymentChannels,
      { id: Date.now().toString(), name: newChannelName, account: newChannelAccount }
    ]);
    setNewChannelName('');
    setNewChannelAccount('');
  };

  const handleRemovePaymentChannel = (id: string) => {
    setPaymentChannels(channels => channels.filter(c => c.id !== id));
  };

  const handleAdminPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword.trim()) return;
    setAdminPassword(newAdminPassword);
    setNewAdminPassword('');
    setPasswordUpdateMsg('Superadmin password updated successfully!');
    setTimeout(() => setPasswordUpdateMsg(''), 3000);
  };

  const getPromoCodeStats = () => {
    const stats: Record<string, number> = {};
    applications.forEach(app => {
      if (app.promoCode.trim()) {
        const code = app.promoCode.toUpperCase();
        stats[code] = (stats[code] || 0) + 1;
      }
    });
    return Object.entries(stats);
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyles.bg, color: themeStyles.text, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, padding: '2.5rem', borderRadius: '16px', maxWidth: '420px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem', color: themeStyles.text }}>DV Staff Portal Login</h2>
            <p style={{ color: themeStyles.subText, fontSize: '0.875rem', margin: 0 }}>Enter your credentials to access the portal.</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Username</label>
              <input required type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={dynamicInputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Password</label>
              <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={dynamicInputStyle} />
            </div>

            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: themeStyles.bg, color: themeStyles.text, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: themeStyles.headerBg, borderBottom: `1px solid ${themeStyles.border}`, padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: themeStyles.text }}>DV Verification Portal</h1>
            <span style={{
              backgroundColor: user.role === 'SUPERADMIN' ? 'rgba(245, 158, 11, 0.2)' : user.role === 'STAFF_MANAGER' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(37, 99, 235, 0.2)',
              color: user.role === 'SUPERADMIN' ? '#f59e0b' : user.role === 'STAFF_MANAGER' ? '#c084fc' : '#60a5fa',
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '800'
            }}>
              {user.role}
            </span>
          </div>
          <p style={{ color: themeStyles.subText, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Signed in as: <strong style={{ color: themeStyles.text }}>{user.name}</strong></p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button onClick={handleLogout} style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', border: 'none', color: themeStyles.text, padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${themeStyles.border}`, paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(user.role === 'SUPERADMIN' || user.role === 'STAFF_MANAGER' || user.role === 'VERIFIER') && (
            <button onClick={() => setActiveTab('applications')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'applications' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'applications' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
              Applications ({applications.length})
            </button>
          )}

          <button onClick={() => setActiveTab('promo_analytics')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'promo_analytics' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'promo_analytics' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
            Promo Analytics
          </button>

          {(user.role === 'SUPERADMIN' || user.role === 'STAFF_MANAGER') && (
            <button onClick={() => setActiveTab('staff_management')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'staff_management' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'staff_management' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
              Staff Management ({staffList.length + 1})
            </button>
          )}

          {user.role === 'SUPERADMIN' && (
            <>
              <button onClick={() => setActiveTab('payment_settings')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'payment_settings' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'payment_settings' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
                Payment Methods
              </button>
              <button onClick={() => setActiveTab('security')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'security' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'security' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
                Security & Password
              </button>
            </>
          )}
        </div>

        {activeTab === 'applications' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStatusFilter('ALL')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'ALL' ? (isDark ? '#334155' : '#cbd5e1') : themeStyles.cardBg, color: themeStyles.text, fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                All ({applications.length})
              </button>
              <button onClick={() => setStatusFilter('Under Review')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Under Review' ? '#f59e0b' : themeStyles.cardBg, color: statusFilter === 'Under Review' ? '#000' : '#f59e0b', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Pending ({applications.filter(a => a.status === 'Under Review').length})
              </button>
              <button onClick={() => setStatusFilter('Approved')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Approved' ? '#10b981' : themeStyles.cardBg, color: statusFilter === 'Approved' ? '#fff' : '#10b981', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Approved ({applications.filter(a => a.status === 'Approved').length})
              </button>
              <button onClick={() => setStatusFilter('Rejected')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Rejected' ? '#ef4444' : themeStyles.cardBg, color: statusFilter === 'Rejected' ? '#fff' : '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Rejected ({applications.filter(a => a.status === 'Rejected').length})
              </button>
            </div>

            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: themeStyles.headerBg, borderBottom: `1px solid ${themeStyles.border}`, color: themeStyles.subText }}>
                    <th style={{ padding: '1rem' }}>Tracking ID</th>
                    <th style={{ padding: '1rem' }}>Applicant Name</th>
                    <th style={{ padding: '1rem' }}>DV Confirmation Code</th>
                    <th style={{ padding: '1rem' }}>Payment Ref</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#60a5fa', fontWeight: '700' }}>{app.id}</td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{app.name}</td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: app.dvConfirmationNumber ? '#10b981' : themeStyles.subText, fontWeight: '700' }}>
                        {app.dvConfirmationNumber || 'Not Issued'}
                      </td>
                      <td style={{ padding: '1rem', color: '#f59e0b', fontFamily: 'monospace' }}>{app.refNo} ({app.paymentChannel})</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontWeight: '700',
                          fontSize: '0.75rem'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setSelectedApp(app)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Inspect Details 👁
                          </button>

                          {(user.role === 'SUPERADMIN' || user.role === 'VERIFIER') && (
                            <>
                              <button onClick={() => setApprovingAppId(app.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Approve & Issue Code
                              </button>
                              <button onClick={() => setRejectingAppId(app.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Reject
                              </button>
                            </>
                          )}
                          {user.role === 'SUPERADMIN' && (
                            <button onClick={() => deleteApplication(app.id)} style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                              Purge 🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: themeStyles.subText }}>No applications found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: APPROVE & ENTER OFFICIAL DV CONFIRMATION CODE */}
        {approvingAppId && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 1000 }}>
            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '16px', padding: '2rem', maxWidth: '450px', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981', margin: '0 0 0.5rem' }}>Approve Application #{approvingAppId}</h3>
              <p style={{ color: themeStyles.subText, fontSize: '0.85rem', margin: '0 0 1.25rem' }}>Enter the official 16-character U.S. DV Lottery Confirmation Number provided by the Department of State.</p>

              <form onSubmit={handleConfirmApproval} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: themeStyles.subText, marginBottom: '0.4rem' }}>DV Confirmation Number *</label>
                  <input
                    required
                    type="text"
                    value={dvCodeInput}
                    onChange={(e) => setDvCodeInput(e.target.value)}
                    placeholder="e.g. 20261OABC987654321"
                    style={dynamicInputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setApprovingAppId(null)} style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', color: themeStyles.text, border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    Issue Code & Approve
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REJECTION REASON PROMPT */}
        {rejectingAppId && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 1000 }}>
            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '16px', padding: '2rem', maxWidth: '450px', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ef4444', margin: '0 0 0.5rem' }}>Reject Application #{rejectingAppId}</h3>
              <p style={{ color: themeStyles.subText, fontSize: '0.85rem', margin: '0 0 1.25rem' }}>Please enter the exact reason for rejection so the applicant can view it during status lookup.</p>

              <form onSubmit={handleConfirmRejection} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: themeStyles.subText, marginBottom: '0.4rem' }}>Rejection Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="e.g. Invalid reference ID, screenshot unreadable, or photo does not meet 600x600 standard."
                    style={{ ...dynamicInputStyle, fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setRejectingAppId(null)} style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', color: themeStyles.text, border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}