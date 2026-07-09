import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useToast, Modal } from '../../components/common';

export default function AdminUsers() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(Array.isArray(data) ? data : data?.users || []);
        } catch {
            toast.error('فشل تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">الاسم</th>
                                <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">البريد</th>
                                <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">الهاتف</th>
                                <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">الدور</th>
                                <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-400">لا يوجد مستخدمين</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3 text-gray-500">{user.email}</td>
                                        <td className="p-3 text-gray-500">{user.phone || '—'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {user.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <Modal isOpen={true} onClose={() => setSelectedUser(null)} title="بيانات المستخدم">
                    <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم</label>
                                <p className="text-sm font-medium">{selectedUser.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</label>
                                <p className="text-sm font-medium">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الهاتف</label>
                                <p className="text-sm font-medium">{selectedUser.phone || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الدور</label>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {selectedUser.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الحالة</label>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {selectedUser.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">تاريخ التسجيل</label>
                                <p className="text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}</p>
                            </div>
                        </div>
                </Modal>
            )}
        </div>
    );
}
