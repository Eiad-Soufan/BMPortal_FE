// src/pages/PointsManager.jsx
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

import { API_BASE_URL } from '../api/axios';

function absMedia(url) {
    if (!url) return null;
    if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;

    const origin = API_BASE_URL.replace(/\/$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}


export default function PointsManager() {
    const [q, setQ] = useState('');
    const [list, setList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [delta, setDelta] = useState(0);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const [enabledMonth, setEnabledMonth] = useState(true);
    const [enabledYear, setEnabledYear] = useState(true);

    const toast = (text, type = 'ok') => {
        setMsg({ text, type });
        setTimeout(() => setMsg(null), 2200);
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/users/search/', { params: { q: '' } });
            setList(res.data || []);
        } catch {
            toast('تعذّر التحميل', 'err');
        } finally {
            setLoading(false);
        }
    };

    const fetchHonorState = async () => {
        try {
            const res = await axios.get('/api/honorboard/');
            setEnabledMonth(!!res.data?.enabled_month);
            setEnabledYear(!!res.data?.enabled_year);
        } catch { }
    };

    useEffect(() => {
        fetchAll();
        fetchHonorState();
    }, []);

    const search = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/users/search/', { params: { q } });
            setList(res.data || []);
        } catch {
            toast('تعذّر البحث', 'err');
        } finally {
            setLoading(false);
        }
    };

    const adjust = async () => {
        if (!selected) return;
        const value = Number(delta);
        if (!Number.isFinite(value)) {
            toast('قيمة غير صالحة', 'err');
            return;
        }
        setBusy(true);
        try {
            const res = await axios.post('/api/points/adjust/', {
                user_id: selected.id,
                delta: value,
                reason: reason || '',
            });
            const updated = { ...selected, points: (selected.points || 0) + Number(res.data?.delta ?? value) };
            setSelected(updated);
            setList((l) => l.map((u) => (u.id === updated.id ? updated : u)));
            setDelta(0);
            setReason('');
            toast('تم حفظ التغيير');
        } catch {
            toast('لم يتم الحفظ', 'err');
        } finally {
            setBusy(false);
        }
    };

    const toggleHonor = async (scope, next) => {
        setBusy(true);
        try {
            const res = await axios.patch('/api/honorboard/toggle/', { scope, enabled: next });
            setEnabledMonth(!!res.data?.enabled_month);
            setEnabledYear(!!res.data?.enabled_year);
            window.dispatchEvent(new CustomEvent('honorboard:toggle', { detail: res.data }));
            toast('تم تحديث لوحة الشرف');
        } catch {
            toast('تعذّر تغيير الحالة', 'err');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Header />
            <div className="container" style={{ padding: '24px 16px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="m-0">إدارة نقاط الموظفين</h2>
                    <div className="d-flex gap-2">
                        <div className="btn-group" role="group" aria-label="Honor board toggles">
                            <button
                                className={`btn btn-sm ${enabledMonth ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                onClick={() => toggleHonor('month', !enabledMonth)}
                                disabled={busy}
                                title="تفعيل/تعطيل موظف الشهر"
                            >
                                {enabledMonth ? 'إخفاء موظف الشهر' : 'إظهار موظف الشهر'}
                            </button>
                            <button
                                className={`btn btn-sm ${enabledYear ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                                onClick={() => toggleHonor('year', !enabledYear)}
                                disabled={busy}
                                title="تفعيل/تعطيل موظف السنة"
                            >
                                {enabledYear ? 'إخفاء موظف السنة' : 'إظهار موظف السنة'}
                            </button>
                        </div>
                        <button className="btn btn-outline-primary btn-sm" onClick={fetchAll} disabled={loading || busy}>
                            تحديث القائمة
                        </button>
                    </div>
                </div>

                <div className="d-flex gap-2 mb-3">
                    <input
                        className="form-control"
                        placeholder="ابحث بالاسم أو اسم المستخدم"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && search()}
                    />
                    <button onClick={search} className="btn btn-success" disabled={busy || loading}>بحث</button>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <strong>الموظفون</strong>
                                    {loading && <span className="text-muted small">جارِ التحميل…</span>}
                                </div>
                                <div className="mt-2" style={{ maxHeight: 420, overflow: 'auto' }}>
                                    {list.length === 0 && !loading && <div className="text-muted">لا يوجد موظفون.</div>}
                                    {list.map((u) => {
                                        const name = ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || u.username;
                                        const active = selected?.id === u.id;
                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => setSelected(u)}
                                                className={'d-flex align-items-center gap-2 p-2 rounded-3 mb-1 ' + (active ? 'bg-primary-subtle' : 'bg-body')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={absMedia(u.avatar) || '/avatar.png'} // ✅ هنا
                                                    alt=""
                                                    style={{ width: 36, height: 36, borderRadius: 999, objectFit: 'cover' }}
                                                    loading="lazy"
                                                />
                                                <div className="flex-grow-1">
                                                    <div style={{ fontWeight: 600 }}>{name}</div>
                                                    <div className="text-muted" style={{ fontSize: 12 }}>@{u.username}</div>
                                                </div>
                                                <span className="badge text-bg-primary">{u.points ?? 0} pts</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <strong>الملف المختار</strong>
                                {!selected && <div className="text-muted mt-2">اختر موظفًا من القائمة</div>}
                                {selected && (
                                    <div className="mt-2">
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <img
                                                src={absMedia(selected.avatar) || '/avatar.png'} // ✅ وهنا
                                                alt=""
                                                style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>
                                                    {(((selected.first_name || '') + ' ' + (selected.last_name || '')).trim()) || selected.username}
                                                </div>
                                                <div className="text-muted">
                                                    النقاط الحالية: <b>{selected.points ?? 0}</b>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 align-items-center">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={delta}
                                                onChange={(e) => setDelta(e.target.value)}
                                                placeholder="+/-"
                                                style={{ maxWidth: 140 }}
                                            />
                                            <input
                                                className="form-control"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="سبب التعديل"
                                            />
                                            <button className="btn btn-primary" onClick={adjust} disabled={busy}>حفظ</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {msg && (
                <div
                    style={{
                        position: 'fixed', bottom: 18, right: 18, zIndex: 1100,
                        background: msg.type === 'err' ? '#ffeded' : '#eefcf0',
                        border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: '10px 14px',
                        boxShadow: '0 8px 24px rgba(0,0,0,.08)', animation: 'pm_fade .2s ease', fontWeight: 500
                    }}
                >
                    {msg.text}
                    <style>{`@keyframes pm_fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
                </div>
            )}

            <Footer />
        </div>
    );
}
