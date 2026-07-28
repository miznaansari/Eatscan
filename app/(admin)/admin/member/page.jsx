"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Shield, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminMemberPage() {
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New member form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
        setMembers(data.members || []);
        if (data.roles?.length > 0 && !roleId) {
          setRoleId(data.roles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobileNo,
          password,
          roleId,
          restaurantId: members[0]?.restaurantId || "clr123sample",
          restaurantMemberRole: "MANAGER",
        }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setMobileNo("");
        setPassword("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-sm font-bold">
        Loading Admin RBAC Directory...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 glass-card border-b border-slate-200/80 px-4 py-4 bg-white/90">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-slate-900 text-lg">Admin Members & Role Permissions (RBAC)</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-8">
        {/* Create Member Form */}
        <section className="glass-card p-6 rounded-3xl bg-white border border-white/80 space-y-4 shadow-sm">
          <h2 className="font-black text-slate-900 text-sm uppercase">Add Admin Team Member</h2>
          <form onSubmit={handleCreateMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
            />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Mobile Number"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
            />
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 flex items-center justify-center space-x-1 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </form>
        </section>

        {/* Roles & Permission Matrices */}
        <section className="space-y-4">
          <h2 className="font-black text-slate-900 text-lg">System Roles (`Role` & `RolePermission`)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-black text-purple-700 text-sm">{r.roleName}</span>
                  <Shield className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">{r.description || "System database role"}</p>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Permissions</span>
                  <div className="flex flex-wrap gap-1">
                    {r.permissions?.map((p) => (
                      <span key={p.id} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {p.permissionName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Existing Members */}
        <section className="space-y-4">
          <h2 className="font-black text-slate-900 text-lg">Active Members ({members.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m) => (
              <div key={m.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">{m.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200">
                    {m.role?.roleName || m.restaurantMemberRole}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                  <div>Email: <span className="text-slate-900 font-bold">{m.email}</span></div>
                  <div>Mobile: <span className="text-slate-900 font-bold">{m.mobileNo}</span></div>
                  <div>Restaurant: <span className="text-purple-700 font-bold">{m.restaurant?.restaurantName}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
