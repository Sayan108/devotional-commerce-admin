import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dateTime, money, request, useApi } from "../shared/api";
import { ErrorMessage, Status, Topbar } from "../shared/ui";

const states = {
  paid: "Paid", ready: "Packed", in_transit: "In transit", delivered: "Delivered",
  pending_payment: "Payment pending", payment_expired: "Payment expired"
};

export function Dashboard() {
  const query = useApi("/admin/metrics");
  return <><Topbar title="Shift dashboard"/><Status query={query}>{data =>
    <div className="metric-grid">{[
      ["Paid unassigned", "paidUnassigned", "urgent"], ["Due soon", "dueSoon"], ["Packing", "packing"], ["Overdue", "overdue", "danger"]
    ].map(([label, key, style]) => <article key={key} className={style}><span>{label}</span><strong>{data[key]}</strong></article>)}</div>
  }</Status><Link to="/orders">Open orders</Link></>;
}

export function Orders() {
  const query = useApi("/admin/orders");
  const [filter, setFilter] = useState("");
  return <><Topbar title="Orders"/>
    <div className="toolbar"><select aria-label="Order status" value={filter} onChange={event => setFilter(event.target.value)}>
      <option value="">All states</option>{Object.entries(states).map(([id, label]) => <option value={id} key={id}>{label}</option>)}
    </select></div>
    <Status query={query}>{data => {
      const orders = data.items.filter(order => !filter || order.state === filter);
      return <section className="panel table-scroll">{orders.length ? <table><thead><tr><th>Reference</th><th>State</th><th>Deadline</th><th>Total</th></tr></thead>
        <tbody>{orders.map(order => <tr key={order.orderRef}><td><Link to={"/orders/" + order.orderRef}>{order.orderRef}</Link></td>
          <td><b className="status">{states[order.state]}</b></td><td>{dateTime(order.promiseBy)}</td><td>{money(order.totalPaise)}</td></tr>)}</tbody></table> : <p>No orders in this view.</p>}</section>;
    }}</Status>
  </>;
}

const actions = {
  paid: ["mark_ready", "Mark ready"], ready: ["mark_in_transit", "Mark in transit"], in_transit: ["mark_delivered", "Mark delivered"]
};

export function OrderDetail() {
  const { id } = useParams();
  const query = useApi("/admin/orders/" + encodeURIComponent(id));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function run(path, body) {
    setBusy(true); setError(null);
    try { await request(path, { method: "POST", body }); query.reload(); }
    catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <><Topbar title={"Order " + id}/><Status query={query}>{order =>
    <div className="detail-layout"><section className="panel">
      <h2>Items</h2><ul>{order.lines.map(line => <li key={line.id}>{line.quantity} × {line.name} · {line.unit}</li>)}</ul>
      <h2>Buyer</h2><p>{order.buyerMasked}</p><p>Delivery deadline {dateTime(order.promiseBy)} IST</p>
      {order.drops.length > 0 && <><h2>Package drops</h2><ul>{order.drops.map((drop, index) => <li className="admin-drop" key={drop.number}>
        Drop {drop.number} · {drop.date} · {drop.state.replaceAll("_", " ")}
        {index > 0 && order.drops[index - 1].state === "delivered" && drop.state !== "delivered" &&
          <button className="button secondary" disabled={busy} onClick={() => run("/admin/orders/" + id + "/drops/" + drop.number + "/actions", {
            state: drop.state === "upcoming" ? "in_transit" : "delivered", reason: "Updated by operations"
          })}>{drop.state === "upcoming" ? "Mark in transit" : "Mark delivered"}</button>}
      </li>)}</ul></>}
    </section><section className="panel"><h2>{states[order.state]}</h2>
      {actions[order.state] && <button className="button" disabled={busy} onClick={() => run("/admin/orders/" + id + "/actions", {
        action: actions[order.state][0], reason: "Updated by operations"
      })}>{actions[order.state][1]}</button>}
      <ErrorMessage error={error}/>
    </section></div>
  }</Status></>;
}
