import React, { useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { StaffLogin } from "../features/StaffLogin";
import { Dashboard, OrderDetail, Orders } from "../features/Orders";
import { Catalog, Coverage, Homepage, Plans, Returns } from "../features/StoreOperations";
import { Customers, CustomerDetail } from "../features/Customers";
import { request, useApi } from "../shared/api";
import { ErrorMessage } from "../shared/ui";

const navigation = [
  ["/", "Dashboard"], ["/orders", "Orders"], ["/catalog", "Catalog"], ["/packages", "Packages"],
  ["/content/home", "Homepage CMS"], ["/customers", "Customers"], ["/coverage", "Coverage"], ["/returns", "Returns"]
];

export function App() {
  const initial = useApi("/v1/auth/session");
  const [identity, setIdentity] = useState(null);
  const [error, setError] = useState(null);
  const session = identity || initial.data;

  async function logout() {
    setIdentity(await request("/v1/auth/logout", { method: "POST" }));
  }

  if (!session && initial.error) return <main className="staff-login"><ErrorMessage error={initial.error}/><button className="button" onClick={initial.reload}>Try again</button></main>;
  if (!session) return <p role="status">Checking staff access…</p>;
  if (!session.admin) return <StaffLogin onLogin={setIdentity} denied={session.verified && session.account} onLogout={logout}/>;
  return <div className="admin-shell">
    <aside><Link className="admin-brand" to="/" aria-label="Naivedya operations home">
      <span><img src="/brand-emblem.png" width="640" height="494" alt=""/></span>
      <strong>Naivedya</strong>
    </Link><nav aria-label="Operations navigation">
      {navigation.map(([path, label]) => <NavLink key={path} to={path} end={path === "/"}>{label}</NavLink>)}
    </nav><button className="button secondary staff" onClick={() => logout().catch(setError)}>Sign out</button></aside>
    <main><ErrorMessage error={error}/><Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/orders" element={<Orders/>}/>
      <Route path="/orders/:id" element={<OrderDetail/>}/>
      <Route path="/catalog" element={<Catalog/>}/>
      <Route path="/packages" element={<Plans/>}/>
      <Route path="/content/home" element={<Homepage/>}/>
      <Route path="/customers" element={<Customers/>}/>
      <Route path="/customers/:ref" element={<CustomerDetail/>}/>
      <Route path="/coverage" element={<Coverage/>}/>
      <Route path="/returns" element={<Returns/>}/>
    </Routes></main>
  </div>;
}
