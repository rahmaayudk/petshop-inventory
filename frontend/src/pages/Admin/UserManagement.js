import React, { useEffect, useState } from 'react';
import { userAPI, handleApiError } from '../../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ id: null, username: '', email: '', password: '' });
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userAPI.getAll();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat pengguna');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await userAPI.create({ username: form.username, password: form.password, email: form.email });
            setForm({ id: null, username: '', email: '', password: '' });
            loadUsers();
        } catch (err) {
            console.error(err);
            const result = handleApiError(err);
            setError(result.message || 'Gagal membuat pengguna');
        }
    };

    const startEdit = (u) => {
        setEditing(true);
        setForm({ id: u.id, username: u.username, email: u.email, password: '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await userAPI.update(form);
            setForm({ id: null, username: '', email: '', password: '' });
            setEditing(false);
            loadUsers();
        } catch (err) {
            console.error(err);
            const result = handleApiError(err);
            setError(result.message || 'Gagal memperbarui pengguna');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus pengguna ini?')) return;
        try {
            await userAPI.delete(id);
            loadUsers();
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus pengguna');
        }
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Manajemen Pengguna</h3>
            </div>

            <div className="row">
                <div className="col-md-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">{editing ? 'Edit Pengguna' : 'Tambah Pengguna'}</h5>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={editing ? handleUpdate : handleCreate}>
                                <div className="mb-2">
                                    <label className="form-label">Username</label>
                                    <input name="username" value={form.username} onChange={handleChange} className="form-control" required />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Email</label>
                                    <input name="email" value={form.email} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Password {editing ? '(kosongkan jika tidak diubah)' : ''}</label>
                                    <input name="password" value={form.password} onChange={handleChange} className="form-control" type="password" required={!editing} />
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-primary" type="submit">{editing ? 'Simpan' : 'Buat'}</button>
                                    {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ id: null, username: '', email: '', password: '' }); }}>Batal</button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Daftar Pengguna</h5>
                            {loading ? (
                                <div>Memuat...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Created At</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td>{u.id}</td>
                                                    <td>{u.username}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.created_at}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(u)}>Edit</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Hapus</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
