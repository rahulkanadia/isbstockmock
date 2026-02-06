import { getAuditLogs } from "@/app/lib/auditLog";

export async function AuditLogs() {
  // Fetch real logs from DB
  const logs = await getAuditLogs(50);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden h-full flex flex-col">
       <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Audit Logs</h3>
       </div>

       <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-zinc-600">
             <thead className="bg-zinc-50 uppercase font-bold text-zinc-400 sticky top-0">
                <tr>
                   <th className="px-4 py-3">Time</th>
                   <th className="px-4 py-3">Admin ID</th>
                   <th className="px-4 py-3">Action</th>
                   <th className="px-4 py-3 text-center">Status</th>
                   <th className="px-4 py-3 text-right">Message</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-zinc-100 font-mono">
                {logs.map((log) => (
                   <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                        {new Date(log.time).toLocaleString('en-GB')}
                      </td>
                      <td className="px-4 py-3 font-bold text-zinc-700">{log.adminId}</td>
                      <td className="px-4 py-3">{log.action.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "SUCCESS" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                            {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-800">{log.target}</td>
                   </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 italic">
                      No audit logs found.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}