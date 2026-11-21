import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dateTime, money, request, useApi } from "../shared/api";
import { ErrorMessage, Status, Topbar } from "../shared/ui";

export function Customers() {
  const query = useApi("/admin/customers");
  return <><Topbar title="Customers" subtitle="Customers with orders"/>
    <Status query={query}>{data => <section className="panel table-scroll">
      <p>Showing up to 100 customers with orders, most recent first.</p>
      {data.items.length ? <table><thead><tr><th>Customer</th><th>Orders</th><th>Latest order</th><th>Last order date</th></tr></thead><tbody>
        {data.items.map(customer => <tr key={customer.latestOrder}><td><Link to={"/customers/" + customer.latestOrder}>{customer.buyerMasked}</Link></td>
          <td>{customer.orderCount}</td><td>{customer.latestOrder}</td><td>{dateTime(customer.latestAt)}</td></tr>)}
      </tbody></table> : <p>No customers with orders yet.</p>}
    </section>}</Status>
  </>;
}

export function CustomerDetail() {
  const { ref } = useParams();
  const query = useApi("/admin/customers/" + encodeURIComponent(ref));
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function create(event) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      await request("/admin/customers/" + encodeURIComponent(ref) + "/cases", { method: "POST", body: { subject, note } });
      setSubject(""); setNote(""); query.reload();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <><Topbar title="Customer support"/><Status query={query}>{customer => <>
    <section className="panel"><h2>{customer.buyerMasked}</h2><p>Up to 100 most recent orders and cases.</p>
      {customer.orders.length ? <div className="table-scroll"><table><thead><tr><th>Order</th><th>Date</th><th>State</th><th>Total</th></tr></thead><tbody>
        {customer.orders.map(order => <tr key={order.orderRef}><td><Link to={"/orders/" + order.orderRef}>{order.orderRef}</Link></td>
          <td>{dateTime(order.placedAt)}</td><td>{order.state.replaceAll("_", " ")}</td><td>{money(order.totalPaise)}</td></tr>)}
      </tbody></table></div> : <p>No orders found.</p>}
    </section>
    <section className="panel cms"><h2>New support case</h2><p>Do not include full phone numbers or sensitive personal information in notes.</p>
      <form onSubmit={create}><label>Subject<input required maxLength={120} value={subject} onChange={event => setSubject(event.target.value)}/></label>
        <label>Internal note<textarea required maxLength={2000} value={note} onChange={event => setNote(event.target.value)}/></label>
        <ErrorMessage error={error}/><button className="button" disabled={busy}>Create case</button>
      </form>
    </section>
    <h2>Support cases</h2>{customer.cases.length ? customer.cases.map(entry => <Case key={entry.caseRef} entry={entry} refresh={query.reload}/>) : <p>No support cases.</p>}
  </>}</Status></>;
}

function Case({ entry, refresh }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(entry.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function update(event) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      await request("/admin/cases/" + encodeURIComponent(entry.caseRef), { method: "POST", body: { note, status } });
      setNote(""); refresh();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <article className="panel cms"><h2>{entry.subject}</h2><p>{entry.caseRef} · {entry.status} · Order {entry.orderRef}</p>
    <ul>{entry.notes.map((item, index) => <li key={index}>{dateTime(item.at)}: {item.text}</li>)}</ul>
    <form onSubmit={update}><label>Internal note<textarea required maxLength={2000} value={note} onChange={event => setNote(event.target.value)}/></label>
      <label>Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="open">Open</option><option value="closed">Closed</option></select></label>
      <ErrorMessage error={error}/><button className="button" disabled={busy}>Add note and update</button>
    </form>
  </article>;
}
