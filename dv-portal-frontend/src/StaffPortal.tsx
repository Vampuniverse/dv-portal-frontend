import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Role = 'SUPERADMIN' | 'STAFF_MANAGER' | 'VERIFIER' | 'PROMO_VIEWER';

interface StaffUser {
  username: string;
  password?: string;
  role: Role;
  name: string;
  assignedChannel?: string;
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

  const [approvingAppId, setApprovingAppId] = useState<string | null>(null);
  const [dvCodeInput, setDvCodeInput] = useState('');

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

  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelItem[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'promo_analytics' | 'staff_management' | 'payment_settings' | 'security'>('applications');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Under Review' | 'Approved' | 'Rejected'>('ALL');

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role>('VERIFIER');
  const [newStaffProvider, setNewStaffProvider] = useState('Telebirr');
  const [newStaffAccount, setNewStaffAccount] = useState('');

  const [promoCodes, setPromoCodes] = useState<string[]>(['DISCOUNT2026', 'ETHIOVIP']);
  const [newPromoInput, setNewPromoInput] = useState('');

  const [applications, setApplications] = useState<Application[]>([]);

  // Fetch data on load and poll backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelsRes, promoRes, appsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/payment-channels').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/promo-codes').catch(() => ({ data: ['DISCOUNT2026', 'ETHIOVIP'] })),
          axios.get('http://localhost:5000/api/applications').catch(() => ({ data: [] }))
        ]);
        setPaymentChannels(channelsRes.data);
        setPromoCodes(promoRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        console.error('Backend sync error:', err);
      }
    };
    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (usernameInput === 'superadmin' && passwordInput === adminPassword) {
      setUser({ username: 'superadmin', role: 'SUPERADMIN', name: 'Master System Admin', assignedChannel: 'ALL' });
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

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingAppId || !dvCodeInput.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/applications/${approvingAppId}`, {
        status: 'Approved',
        dvConfirmationNumber: dvCodeInput.trim()
      });
    } catch (err) {
      // Fallback local update if offline
    }

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

  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId || !rejectionReasonInput.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/applications/${rejectingAppId}`, {
        status: 'Rejected',
        rejectionReason: rejectionReasonInput.trim()
      });
    } catch (err) {
      // Fallback local update if offline
    }

    setApplications(apps =>
      apps.map(app => app.id === rejectingAppId ? {
        ...app,
        status: 'Rejected',
        rejectionReason: rejectionReasonInput.trim(),
        dvConfirmationNumber: undefined
      } : app)
    );

    setRejectingAppId(null);
    setRejectionReasonInput('');
  };

  const deleteApplication = async (id: string) => {
    if (confirm(`Superadmin Action: Are you sure you want to permanently delete record ${id}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/applications/${id}`);
      } catch (err) {}
      setApplications(apps => apps.filter(app => app.id !== id));
    }
  };

  const addStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUser.trim() || !newStaffPassword.trim() || !newStaffAccount.trim()) return;

    if (newStaffRole === 'SUPERADMIN') {
      alert('Permission Denied: Only one Superadmin is permitted in the system.');
      return;
    }

    const assignedChannelString = `${newStaffProvider} - ${newStaffAccount.trim()}`;

    try {
      await axios.post('http://localhost:5000/api/payment-channels', {
        name: newStaffProvider,
        account: newStaffAccount.trim()
      });
      const res = await axios.get('http://localhost:5000/api/payment-channels');
      setPaymentChannels(res.data);
    } catch (err) {
      setPaymentChannels(prev => [...prev, { id: Date.now().toString(), name: newStaffProvider, account: newStaffAccount.trim() }]);
    }

    setStaffList([
      ...staffList,
      { 
        username: newStaffUser.toLowerCase(), 
        password: newStaffPassword, 
        role: newStaffRole, 
        name: newStaffName,
        assignedChannel: assignedChannelString
      }
    ]);

    setNewStaffName('');
    setNewStaffUser('');
    setNewStaffPassword('');
    setNewStaffAccount('');
  };

  const removeStaffAccount = (username: string) => {
    setStaffList(list => list.filter(s => s.username !== username));
  };

  const handleRemovePaymentChannel = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/payment-channels/${id}`);
    } catch (err) {}
    setPaymentChannels(channels => channels.filter(c => c.id !== id));
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoInput.trim()) return;
    const formatted = newPromoInput.trim().toUpperCase();
    
    try {
      await axios.post('http://localhost:5000/api/promo-codes', { code: formatted });
    } catch (err) {}

    if (!promoCodes.includes(formatted)) {
      setPromoCodes([...promoCodes, formatted]);
    }
    setNewPromoInput('');
  };

  const handleRemovePromoCode = async (code: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/promo-codes/${code}`);
    } catch (err) {}
    setPromoCodes(promoCodes.filter(c => c !== code));
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
      if (user?.role !== 'SUPERADMIN' && user?.assignedChannel && user.assignedChannel !== 'ALL' && app.paymentChannel !== user.assignedChannel) {
        return;
      }
      if (app.promoCode && app.promoCode.trim()) {
        const code = app.promoCode.toUpperCase();
        stats[code] = (stats[code] || 0) + 1;
      }
    });
    return Object.entries(stats);
  };

  const filteredApplications = applications.filter(app => {
    if (user?.role !== 'SUPERADMIN' && user?.assignedChannel && user.assignedChannel !== 'ALL') {
      if (app.paymentChannel !== user.assignedChannel) return false;
    }
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyles.bg, color: themeStyles.text, fontFamily: 'system-ui, sans-serif', padding: '1rem', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, padding: '2.5rem', borderRadius: '16px', maxWidth: '420px', width: '100%', boxSizing: 'border-box' }}>
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
      <header style={{ backgroundColor: themeStyles.headerBg, borderBottom: `1px solid ${themeStyles.border}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
          <p style={{ color: themeStyles.subText, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Signed in as: <strong style={{ color: themeStyles.text }}>{user.name}</strong> 
            {user.assignedChannel && user.assignedChannel !== 'ALL' && (
              <span style={{ color: '#f59e0b', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                [{user.assignedChannel}]
              </span>
            )}
          </p>
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

      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${themeStyles.border}`, paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(user.role === 'SUPERADMIN' || user.role === 'STAFF_MANAGER' || user.role === 'VERIFIER') && (
            <button onClick={() => setActiveTab('applications')} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'applications' ? '#2563eb' : (isDark ? '#0f172a' : '#e2e8f0'), color: activeTab === 'applications' ? '#fff' : themeStyles.subText, fontWeight: '700', cursor: 'pointer' }}>
              Applications ({filteredApplications.length})
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

        {/* TAB 1: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div>
            {user.role !== 'SUPERADMIN' && user.assignedChannel && user.assignedChannel !== 'ALL' && (
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#60a5fa' }}>
                ℹ️ Displaying transactions paid specifically to your assigned account: <strong>{user.assignedChannel}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStatusFilter('ALL')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'ALL' ? (isDark ? '#334155' : '#cbd5e1') : themeStyles.cardBg, color: themeStyles.text, fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                All ({filteredApplications.length})
              </button>
              <button onClick={() => setStatusFilter('Under Review')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Under Review' ? '#f59e0b' : themeStyles.cardBg, color: statusFilter === 'Under Review' ? '#000' : '#f59e0b', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Pending ({filteredApplications.filter(a => a.status === 'Under Review').length})
              </button>
              <button onClick={() => setStatusFilter('Approved')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Approved' ? '#10b981' : themeStyles.cardBg, color: statusFilter === 'Approved' ? '#fff' : '#10b981', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Approved ({filteredApplications.filter(a => a.status === 'Approved').length})
              </button>
              <button onClick={() => setStatusFilter('Rejected')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: statusFilter === 'Rejected' ? '#ef4444' : themeStyles.cardBg, color: statusFilter === 'Rejected' ? '#fff' : '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Rejected ({filteredApplications.filter(a => a.status === 'Rejected').length})
              </button>
            </div>

            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: '750px' }}>
                <thead>
                  <tr style={{ backgroundColor: themeStyles.headerBg, borderBottom: `1px solid ${themeStyles.border}`, color: themeStyles.subText }}>
                    <th style={{ padding: '1rem' }}>Tracking ID</th>
                    <th style={{ padding: '1rem' }}>Applicant Name</th>
                    <th style={{ padding: '1rem' }}>DV Confirmation Code</th>
                    <th style={{ padding: '1rem' }}>Payment Account & Ref</th>
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
                      <td style={{ padding: '1rem', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        <div><strong>{app.refNo}</strong></div>
                        <div style={{ color: themeStyles.subText, fontSize: '0.75rem' }}>{app.paymentChannel}</div>
                      </td>
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
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button onClick={() => setSelectedApp(app)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Inspect 👁
                          </button>

                          {(user.role === 'SUPERADMIN' || user.role === 'VERIFIER') && (
                            <>
                              <button onClick={() => setApprovingAppId(app.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Approve
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
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: themeStyles.subText }}>No applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PROMO ANALYTICS & CODE MANAGEMENT */}
        {activeTab === 'promo_analytics' && (
          <div>
            {user.role === 'SUPERADMIN' && (
              <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Manage Promo Codes</h2>
                <p style={{ color: themeStyles.subText, fontSize: '0.9rem', marginBottom: '1.25rem' }}>Add valid promo codes or remove existing ones. Invalid codes entered by applicants will be rejected.</p>

                <form onSubmit={handleAddPromoCode} style={{ display: 'flex', gap: '1rem', maxWidth: '450px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <input
                    required
                    type="text"
                    value={newPromoInput}
                    onChange={(e) => setNewPromoInput(e.target.value)}
                    placeholder="Enter new promo code (e.g. SAVE50)"
                    style={{ ...dynamicInputStyle, flex: 1 }}
                  />
                  <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    Add Code
                  </button>
                </form>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {promoCodes.map((code) => (
                    <div key={code} style={{ backgroundColor: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa' }}>
                      {code}
                      <button onClick={() => handleRemovePromoCode(code)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Promo & Referral Code Usage Analytics</h2>
              <p style={{ color: themeStyles.subText, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {user.role === 'SUPERADMIN' || user.assignedChannel === 'ALL'
                  ? 'Overview of promotional codes applied across all accounts.'
                  : `Overview of promotional codes for your assigned account: ${user.assignedChannel}`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {getPromoCodeStats().map(([code, count]) => (
                  <div key={code} style={{ backgroundColor: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, padding: '1.25rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', color: themeStyles.subText, fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Promo Code</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#60a5fa', marginBottom: '0.5rem', fontFamily: 'monospace' }}>{code}</div>
                    <div style={{ fontSize: '0.85rem', color: themeStyles.text }}>Total Uses: <strong>{count} applications</strong></div>
                  </div>
                ))}
                {getPromoCodeStats().length === 0 && (
                  <p style={{ color: themeStyles.subText }}>No promo codes have been used in applications yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff_management' && (
          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Staff Accounts Management</h2>
            <p style={{ color: themeStyles.subText, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create staff accounts and link their login directly to their payment account details.</p>

            {(user.role === 'SUPERADMIN' || user.role === 'STAFF_MANAGER') && (
              <form onSubmit={addStaffAccount} style={{ backgroundColor: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Full Name</label>
                  <input required type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="e.g. John Doe" style={dynamicInputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Username</label>
                  <input required type="text" value={newStaffUser} onChange={(e) => setNewStaffUser(e.target.value)} placeholder="e.g. johnstaff" style={dynamicInputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Password</label>
                  <input required type="password" value={newStaffPassword} onChange={(e) => setNewStaffPassword(e.target.value)} placeholder="••••••••" style={dynamicInputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Role</label>
                  <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value as Role)} style={dynamicInputStyle}>
                    <option value="VERIFIER">Verifier</option>
                    <option value="STAFF_MANAGER">Staff Manager</option>
                    <option value="PROMO_VIEWER">Promo Viewer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Payment Provider</label>
                  <select value={newStaffProvider} onChange={(e) => setNewStaffProvider(e.target.value)} style={dynamicInputStyle}>
                    <option value="Telebirr">Telebirr</option>
                    <option value="CBE Birr">CBE Birr</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.4rem' }}>Payment Account / Phone</label>
                  <input required type="text" value={newStaffAccount} onChange={(e) => setNewStaffAccount(e.target.value)} placeholder="e.g. +251912345678" style={dynamicInputStyle} />
                </div>
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', height: '44px', gridColumn: '1 / -1' }}>
                  Create Admin & Link Payment Account
                </button>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: themeStyles.headerBg, borderBottom: `1px solid ${themeStyles.border}`, color: themeStyles.subText }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Username</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Linked Payment Account</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Master System Admin</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>superadmin</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: '#f59e0b', fontWeight: '800' }}>SUPERADMIN</span></td>
                    <td style={{ padding: '1rem', color: '#60a5fa', fontWeight: '700' }}>All Accounts</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}><span style={{ color: themeStyles.subText, fontSize: '0.8rem' }}>System Protected</span></td>
                  </tr>
                  {staffList.map((s) => (
                    <tr key={s.username} style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{s.username}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: '#60a5fa', fontWeight: '700', fontSize: '0.8rem' }}>{s.role}</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {s.assignedChannel}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {(user.role === 'SUPERADMIN' || user.role === 'STAFF_MANAGER') && (
                          <button onClick={() => removeStaffAccount(s.username)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Revoke ❌
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT METHODS SETTINGS */}
        {activeTab === 'payment_settings' && user.role === 'SUPERADMIN' && (
          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Payment Accounts Pool</h2>
            <p style={{ color: themeStyles.subText, fontSize: '0.9rem', marginBottom: '1.5rem' }}>View accounts configured across all admin accounts.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {paymentChannels.map((channel) => (
                <div key={channel.id} style={{ backgroundColor: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, padding: '1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>{channel.name}</div>
                    <div style={{ fontFamily: 'monospace', color: '#f59e0b', fontSize: '0.9rem' }}>{channel.account}</div>
                  </div>
                  <button onClick={() => handleRemovePaymentChannel(channel.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem' }}>
                    ✕
                  </button>
                </div>
              ))}
              {paymentChannels.length === 0 && (
                <p style={{ color: themeStyles.subText }}>No payment channels linked yet. Create staff accounts with payment details to populate this pool.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & PASSWORD */}
        {activeTab === 'security' && user.role === 'SUPERADMIN' && (
          <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', padding: '2rem', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Change Superadmin Password</h2>
            <p style={{ color: themeStyles.subText, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update your master administrative login password.</p>

            {passwordUpdateMsg && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {passwordUpdateMsg}
              </div>
            )}

            <form onSubmit={handleAdminPasswordChange} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: themeStyles.subText, marginBottom: '0.5rem', textTransform: 'uppercase' }}>New Master Password</label>
                <input required type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="Enter new password" style={dynamicInputStyle} />
              </div>

              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
                Update Master Password
              </button>
            </form>
          </div>
        )}

        {/* MODAL: INSPECT APPLICATION DETAILS */}
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 1000, overflowY: 'auto' }}>
            <div style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '16px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#60a5fa', fontFamily: 'monospace' }}>Application {selectedApp.id}</h3>
                <button onClick={() => setSelectedApp(null)} style={{ backgroundColor: 'transparent', border: 'none', color: themeStyles.text, fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div><strong>Full Name:</strong> {selectedApp.name}</div>
                <div><strong>Passport:</strong> {selectedApp.passport}</div>
                <div><strong>Email:</strong> {selectedApp.email}</div>
                <div><strong>Phone:</strong> {selectedApp.phone}</div>
                <div><strong>Date of Birth:</strong> {selectedApp.dob}</div>
                <div><strong>City of Birth:</strong> {selectedApp.cityOfBirth}</div>
                <div><strong>Education:</strong> {selectedApp.education}</div>
                <div><strong>Marital Status:</strong> {selectedApp.maritalStatus}</div>
                <div><strong>Children Count:</strong> {selectedApp.children}</div>
                <div><strong>Promo Code:</strong> {selectedApp.promoCode || 'None'}</div>
                <div><strong>Payment Account:</strong> {selectedApp.paymentChannel}</div>
                <div><strong>Transaction Ref:</strong> {selectedApp.refNo}</div>
              </div>

              {selectedApp.dvConfirmationNumber && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Issued DV Confirmation Number</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{selectedApp.dvConfirmationNumber}</div>
                </div>
              )}

              {selectedApp.rejectionReason && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                  <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}

              <button onClick={() => setSelectedApp(null)} style={{ width: '100%', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', color: themeStyles.text, border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* MODAL: APPROVAL */}
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

        {/* MODAL: REJECTION */}
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