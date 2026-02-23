"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LogOut, Activity, ShieldAlert, Clock, RefreshCw, 
  Search, Save, XCircle, ExternalLink, X, AlertCircle, Filter, Loader2, FilterX
} from "lucide-react";
import { saveAdminEdits } from "./actions";

const formatDateForInput = (dateStr: string) => new Date(dateStr).toISOString().split('T')[0];

export default function AdminConsole({ initialUsers, admins, stats }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [edits, setEdits] = useState<Record<string, any>>({});
  
  // Master Filter State
  const [filterMode, setFilterMode] = useState<string>('all');
  
  // Live Streaming Fetch State
  const [fetchState, setFetchState] = useState<'idle' | 'fetching' | 'done'>('idle');
  const [fetchAttempted, setFetchAttempted] = useState(0);
  const [fetchUpdated, setFetchUpdated] = useState(0);
  const [fetchFailed, setFetchFailed] = useState(0);
  const [failedSymbols, setFailedSymbols] = useState<string[]>([]);
  const [liveLastUpdate, setLiveLastUpdate] = useState(stats.lastUpdate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && query) setQuery("");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const multiUserSymbols = useMemo(() => {
    const counts: Record<string, number> = {};
    initialUsers.forEach((u: any) => {
      if (u.symbol !== 'PENDING') counts[u.symbol] = (counts[u.symbol] || 0) + 1;
    });
    return Object.entries(counts).filter(([_, c]) => c > 1).map(([s]) => s);
  }, [initialUsers]);

  // Master Filter Engine
  const filteredUsers = useMemo(() => {
    let result = initialUsers;
    
    if (filterMode !== 'all') {
      if (filterMode.includes('participants')) result = result.filter((u: any) => u.symbol !== 'PENDING');
      if (filterMode.includes('legacy')) result = result.filter((u: any) => u.id.startsWith('legacy_'));
      if (filterMode.endsWith('_allowed')) result = result.filter((u: any) => !u.isExcluded);
      if (filterMode.endsWith('_banned')) result = result.filter((u: any) => u.isExcluded);
      
      if (filterMode === 'multistock') result = result.filter((u: any) => multiUserSymbols.includes(u.symbol));
      if (filterMode === 'multipick') result = []; 
      
      // NEW: Failed symbols quick filter
      if (filterMode === 'failed_fetch') result = result.filter((u: any) => failedSymbols.includes(u.symbol));
    }
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((u: any) => 
        u.username.toLowerCase().includes(q) || 
        u.symbol.toLowerCase().includes(q)
      );
    }
    return result;
  }, [query, filterMode, initialUsers, multiUserSymbols, failedSymbols]);

  const handleEdit = (userId: string, field: string, value: any) => {
    setEdits(prev => ({ ...prev, [userId]: { ...(prev[userId] || {}), [field]: value } }));
  };

  const revertChange = (userId: string, field: string) => {
    setEdits(prev => {
      const userEdits = { ...prev[userId] };
      delete userEdits[field];
      const newEdits = { ...prev };
      if (Object.keys(userEdits).length === 0) delete newEdits[userId];
      else newEdits[userId] = userEdits;
      return newEdits;
    });
  };

  const applyChanges = async () => {
    if (!hasChanges) return;
    startTransition(async () => {
      await saveAdminEdits(edits);
      setEdits({});
      router.refresh(); 
    });
  };

  // The Streaming Stream Reader
  const handleFetchPrice = async () => {
    setFetchState('fetching');
    setFetchAttempted(0); setFetchUpdated(0); setFetchFailed(0); setFailedSymbols([]);
    
    try {
      const res = await fetch(`/api/cron/prices?secret=${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);
          
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.type === 'progress') {
              setFetchAttempted(data.attempted);
              setFetchUpdated(data.updatedCount);
              setFetchFailed(data.failedCount);
            } else if (data.type === 'done') {
              setFetchAttempted(data.attempted);
              setFetchUpdated(data.updatedCount);
              setFetchFailed(data.failedCount);
              setFailedSymbols(data.failedSymbols || []);
              if (data.updatedAt) {
                setLiveLastUpdate(new Date(data.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }));
              }
            }
          }
        }
      }
      setFetchState('done');
      router.refresh(); 
      setTimeout(() => setFetchState('idle'), 5000);
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      setFetchState('idle');
    }
  };

  const hasChanges = Object.keys(edits).length > 0;

  // New Grid Table Row Component
  const StatRow = ({ label, stat, prefix }: any) => (
    <div className="flex items-center py-1.5 border-b border-gray-50 last:border-0 group">
      <button onClick={() => setFilterMode(`${prefix}_total`)} className="flex-1 text-sm font-bold text-gray-600 hover:text-[#5865F2] transition-colors text-left truncate">{label}</button>
      <div className="flex gap-4 text-xs font-mono font-black text-center pr-2">
        <button onClick={() => setFilterMode(`${prefix}_total`)} className={cn("w-14 py-0.5 rounded transition-colors", filterMode === `${prefix}_total` ? "bg-[#5865F2] text-white" : "text-gray-500 hover:bg-gray-100")}>{stat.total}</button>
        <button onClick={() => setFilterMode(`${prefix}_allowed`)} className={cn("w-14 py-0.5 rounded transition-colors", filterMode === `${prefix}_allowed` ? "bg-[#5865F2] text-white" : "text-success hover:bg-green-50")}>{stat.allowed}</button>
        <button onClick={() => setFilterMode(`${prefix}_banned`)} className={cn("w-14 py-0.5 rounded transition-colors", filterMode === `${prefix}_banned` ? "bg-[#5865F2] text-white" : "text-danger hover:bg-red-50")}>{stat.banned}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-ink">
      
      <header className="flex justify-between items-center px-6 h-[4.5rem] border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-1/3 flex justify-start">
          <Link href="/" className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-float transition-transform hover:-translate-y-0.5">
            Competition dashboard
          </Link>
        </div>
        <div className="w-1/3 flex justify-center text-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-ink uppercase whitespace-nowrap">
            ISBSTOCKMOCK
          </h1>
        </div>
        <div className="w-1/3 flex justify-end">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-xs font-black uppercase text-[#5865F2] hover:text-[#4752C4] transition-colors">
            Sign Out <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px] flex-shrink-0">
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* GRID TABLE HEADER */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center pr-7">
               <div className="flex-1 flex items-center gap-2">
                 <Activity size={14} className="text-gray-500" /> 
                 <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">System Status</h2>
               </div>
               <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                 <div className="w-14">Total</div>
                 <div className="w-14">Allowed</div>
                 <div className="w-14">Banned</div>
               </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex flex-col">
                <StatRow label="Total Users" stat={stats.users} prefix="users" />
                <StatRow label="Total Competition Entries" stat={stats.entries} prefix="participants" />
                <StatRow label="Legacy Entries" stat={stats.legacy} prefix="legacy" />
                
                <div className="flex items-center py-1.5 border-b border-gray-50">
                   <button onClick={() => setFilterMode('multipick')} className="flex-1 text-sm font-bold text-gray-600 hover:text-[#5865F2] transition-colors text-left truncate">Users w/ Multiple Picks</button>
                   <div className="flex gap-4 text-xs font-mono font-black text-center pr-2">
                     <button onClick={() => setFilterMode('multipick')} className={cn("w-14 py-0.5 rounded transition-colors", filterMode === 'multipick' ? "bg-[#5865F2] text-white" : (stats.multiPickUsers > 0 ? "text-danger bg-red-50 hover:bg-red-100" : "text-gray-500 hover:bg-gray-100"))}>{stats.multiPickUsers}</button>
                     <div className="w-14 opacity-0">-</div><div className="w-14 opacity-0">-</div>
                   </div>
                </div>

                <div className="flex items-center py-1.5">
                   <button onClick={() => setFilterMode('multistock')} className="flex-1 text-sm font-bold text-gray-600 hover:text-[#5865F2] transition-colors text-left truncate">Stocks w/ Multiple Users</button>
                   <div className="flex gap-4 text-xs font-mono font-black text-center pr-2">
                     <button onClick={() => setFilterMode('multistock')} className={cn("w-14 py-0.5 rounded transition-colors", filterMode === 'multistock' ? "bg-[#5865F2] text-white" : (stats.multiUserStocks > 0 ? "text-danger bg-red-50 hover:bg-red-100" : "text-gray-500 hover:bg-gray-100"))}>{stats.multiUserStocks}</button>
                     <div className="w-14 opacity-0">-</div><div className="w-14 opacity-0">-</div>
                   </div>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-100">
                {/* PERSISTENT LIVE FETCH STATS */}
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-2">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} /> <span className="font-mono">{liveLastUpdate}</span>
                  </div>
                  {fetchAttempted > 0 && (
                    <div className="flex gap-2 font-mono">
                      <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Att: {fetchAttempted}</span>
                      <span className="text-success bg-green-50 px-1.5 py-0.5 rounded">Fet: {fetchUpdated}</span>
                      <button onClick={() => setFilterMode('failed_fetch')} className={cn("px-1.5 py-0.5 rounded transition-colors cursor-pointer", filterMode === 'failed_fetch' ? "bg-danger text-white" : "text-danger bg-red-50 hover:bg-red-100")} title="View Failed Symbols">
                        Fail: {fetchFailed}
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleFetchPrice} 
                  disabled={fetchState !== 'idle'}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm",
                    fetchState === 'fetching' ? "bg-gray-100 text-[#5865F2] border border-[#5865F2]/20 shadow-inner" : 
                    fetchState === 'done' ? "bg-green-50 text-success border border-green-200" : 
                    "bg-ink hover:bg-ink/90 text-white cursor-pointer"
                  )}
                >
                  {fetchState === 'idle' && <><RefreshCw size={16} /> Fetch Latest Price</>}
                  {fetchState === 'fetching' && <><Loader2 size={16} className="animate-spin" /> Fetching Market Data...</>}
                  {fetchState === 'done' && <><RefreshCw size={16} /> Update Complete</>}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2"><ShieldAlert size={14} /> Admin Access Roster</h2>
              <span className="text-[10px] font-black uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{admins.length} Admins</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {admins.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-500">{admin.username.charAt(0).toUpperCase()}</div>
                    <span className="text-sm font-bold text-ink">@{admin.username}</span>
                  </div>
                  <select 
                    value={edits[admin.id]?.adminLevel !== undefined ? edits[admin.id].adminLevel : admin.level}
                    onChange={(e) => handleEdit(admin.id, 'adminLevel', parseInt(e.target.value))}
                    className={`text-xs font-bold border rounded-md px-3 py-1.5 outline-none cursor-pointer transition-all ${edits[admin.id]?.adminLevel !== undefined ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-gray-100 border-transparent text-ink hover:bg-gray-200'}`}
                  >
                    <option value={4}>Level 4 (Superadmin)</option>
                    <option value={3}>Level 3 (Manager)</option>
                    <option value={2}>Level 2 (Moderator)</option>
                    <option value={1}>Level 1 (Helper)</option>
                    <option value={0}>Level 0 (Remove)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[600px] overflow-hidden">
          
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
            <h2 className="text-sm font-black uppercase tracking-widest text-ink">Competition Data</h2>
            
            {/* Toggles, Clear Button, and Fixed-Width Search Box */}
            <div className="flex items-center gap-3 flex-1 justify-end mx-4">
              
              {filterMode !== 'all' && (
                <button 
                  onClick={() => setFilterMode('all')}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-discord text-white flex items-center gap-2 shadow-sm transition-all hover:bg-[#4752C4] animate-in fade-in zoom-in-95 duration-200"
                >
                  Clear Active Filter <FilterX size={14} />
                </button>
              )}

              {/* Fixed Flex-Shrink-0 Search Container */}
              <div className="relative w-72 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text"
                  placeholder="Search user or symbol..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm font-bold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:font-medium placeholder:text-gray-400 transition-all"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-danger p-0.5 rounded transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={() => setEdits({})}
                disabled={!hasChanges || isPending}
                className={`w-44 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${hasChanges ? 'bg-red-50 text-danger hover:bg-red-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <XCircle size={16} /> Discard Changes
              </button>
              <button 
                onClick={applyChanges}
                disabled={!hasChanges || isPending}
                className={`w-44 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${hasChanges ? 'bg-success text-white hover:bg-green-600 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Save size={16} /> {isPending ? "Saving..." : "Apply Changes"}
              </button>
            </div>
          </div>

          <div className="px-5 py-2 border-b border-gray-200 bg-white sticky top-[68px] z-20 min-h-[64px] flex items-start flex-shrink-0">
            {!hasChanges ? (
              <div className="flex items-center gap-2 text-gray-400 h-full py-2">
                <AlertCircle size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">No pending changes</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 py-1">
                {Object.entries(edits).map(([userId, userEdits]) => {
                  const user = initialUsers.find((u: any) => u.id === userId);
                  const cleanUsername = user?.username.replace(/^legacy_/, '') || 'Unknown';
                  
                  return Object.keys(userEdits).map((field) => {
                    const fieldLabels: Record<string, string> = { entryDate: "Date Change", symbol: "Pick Update", entryPrice: "Price Edit", isExcluded: "Status Change", adminLevel: "Admin Rights" };
                    return (
                      <div key={`${userId}-${field}`} className="flex items-center gap-1 bg-yellow-100 border border-yellow-300 text-yellow-800 px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <span>@{cleanUsername} - {fieldLabels[field] || field}</span>
                        <button onClick={() => revertChange(userId, field)} className="ml-1 hover:text-danger hover:bg-yellow-200 rounded p-0.5 transition-colors">
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-white relative">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white shadow-sm z-10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="p-4 border-b border-gray-100 w-[20%]">User</th>
                  <th className="p-4 border-b border-gray-100 w-[20%]">Entry Date</th>
                  <th className="p-4 border-b border-gray-100 w-[25%]">Stock Pick</th>
                  <th className="p-4 border-b border-gray-100 w-[15%]">Entry Price</th>
                  <th className="p-4 border-b border-gray-100 w-[20%]">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {filteredUsers.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="p-8 text-center text-gray-400 italic">No users match the current filter.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any) => {
                    const userEdits = edits[user.id] || {};
                    const isRowEdited = Object.keys(userEdits).length > 0;
                    const cleanUsername = user.username.replace(/^legacy_/, '');

                    const displayDate = userEdits.entryDate !== undefined ? userEdits.entryDate : user.entryDate;
                    const displaySymbol = userEdits.symbol !== undefined ? userEdits.symbol : user.symbol;
                    const displayPrice = userEdits.entryPrice !== undefined ? userEdits.entryPrice : user.entryPrice;
                    const displayStatus = userEdits.isExcluded !== undefined ? userEdits.isExcluded : user.isExcluded;

                    return (
                      <tr key={user.id} className={`border-b border-gray-50 transition-colors ${isRowEdited ? 'bg-yellow-50/30' : 'hover:bg-gray-50'}`}>
                        <td className="p-4 text-ink truncate">@{cleanUsername}</td>
                        <td className="p-4">
                          <input type="date" value={formatDateForInput(displayDate)} onChange={(e) => handleEdit(user.id, 'entryDate', e.target.value)} className={`bg-transparent border ${userEdits.entryDate !== undefined ? 'border-yellow-400 bg-yellow-100/50' : 'border-gray-200'} rounded px-2 py-1 text-xs font-mono w-32 focus:outline-none focus:ring-2 focus:ring-[#5865F2]`} />
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <input type="text" value={displaySymbol} onChange={(e) => handleEdit(user.id, 'symbol', e.target.value.toUpperCase())} className={`bg-transparent border ${userEdits.symbol !== undefined ? 'border-yellow-400 bg-yellow-100/50' : 'border-gray-200'} rounded px-2 py-1 text-xs font-mono uppercase w-28 focus:outline-none focus:ring-2 focus:ring-[#5865F2]`} />
                          <a href={`https://finance.yahoo.com/quote/${displaySymbol}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#5865F2] transition-colors p-1" title="View on Yahoo Finance"><ExternalLink size={14} /></a>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1">₹</span>
                            <input type="number" step="0.01" value={displayPrice} onChange={(e) => handleEdit(user.id, 'entryPrice', parseFloat(e.target.value))} className={`bg-transparent border ${userEdits.entryPrice !== undefined ? 'border-yellow-400 bg-yellow-100/50' : 'border-gray-200'} rounded px-2 py-1 text-xs font-mono w-24 focus:outline-none focus:ring-2 focus:ring-[#5865F2]`} />
                          </div>
                        </td>
                        <td className="p-4">
                          <select value={displayStatus ? "banned" : "allowed"} onChange={(e) => handleEdit(user.id, 'isExcluded', e.target.value === "banned")} className={`text-xs font-bold border rounded-md px-3 py-1.5 outline-none cursor-pointer transition-all ${userEdits.isExcluded !== undefined ? 'border-yellow-400 bg-yellow-100/50 text-yellow-800' : displayStatus ? 'bg-red-50 text-danger border-red-200' : 'bg-green-50 text-success border-green-200'}`}>
                            <option value="allowed">Allowed</option>
                            <option value="banned">Banned</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}