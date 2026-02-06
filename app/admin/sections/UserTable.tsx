"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type AdminUser = {
  id: string;
  username: string;
  isBanned: boolean;
  activePick: {
    symbol: string;
    entryPrice: number;
    entryDate: string;
  } | null;
};

export function UserTable() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA
  async function fetchUsers() {
    try {
        const res = await fetch("/api/admin/users");
        if(res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    } catch(e) {
        console.error("Failed to fetch users", e);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sync URL search param
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchTerm(query);
  }, [searchParams]);

  // 2. FILTERING LOGIC
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const terms = searchTerm.split(",").map(t => t.replace(/\s/g, "").toLowerCase()).filter(t => t.length > 0);
    if (terms.length === 0) return users;

    return users.filter((user) => {
        const username = user.username.replace(/\s/g, "").toLowerCase();
        return terms.some(term => username.includes(term));
    });
  }, [searchTerm, users]);

  if (loading) return <div className="p-12 text-center text-zinc-400">Loading users...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between gap-4 bg-zinc-50/30">
        <h3 className="text-lg font-bold text-zinc-900">User Management</h3>
        <input
          type="text"
          placeholder="Search users (separate by comma)..."
          className="px-4 py-2 border border-zinc-300 rounded-lg text-sm w-full sm:w-96 focus:ring-2 focus:ring-purple-500 outline-none text-zinc-900 placeholder:text-zinc-400 bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-zinc-600 whitespace-nowrap">
          <thead className="bg-zinc-50 text-xs uppercase font-bold text-zinc-500 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-center">User</th>
              <th className="px-6 py-4 text-center">Symbol</th>
              <th className="px-6 py-4 text-center">Entry Price</th>
              <th className="px-6 py-4 text-center">Entry Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-zinc-900">{user.username}</td>
                
                <td className="px-6 py-4 text-center">
                  {user.activePick ? (
                    <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{user.activePick.symbol}</span>
                  ) : "-"}
                </td>

                <td className="px-6 py-4 text-center font-mono">
                  {user.activePick ? `₹${user.activePick.entryPrice.toFixed(2)}` : "-"}
                </td>

                <td className="px-6 py-4 text-center">
                  {user.activePick ? new Date(user.activePick.entryDate).toLocaleDateString('en-IN') : "-"}
                </td>

                 <td className="px-6 py-4 text-center">
                   {user.isBanned ? (
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Banned
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                     </span>
                   )}
                </td>

                <td className="px-6 py-4 text-center">
                   <button 
                     onClick={() => alert(`Functionality to ban ${user.username} would go here`)}
                     className="text-xs border border-zinc-200 px-3 py-1.5 rounded hover:bg-zinc-50 font-medium"
                   >
                     Manage
                   </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-zinc-400 italic">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}