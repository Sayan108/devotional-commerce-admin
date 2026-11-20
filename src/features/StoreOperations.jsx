import React, { useState } from "react";
import { money, request, useApi } from "../shared/api";
import { ErrorMessage, Status, Topbar } from "../shared/ui";

export function Catalog() {
  const query = useApi("/v1/products");
  const [filter, setFilter] = useState("");
  return <><Topbar title="Catalog"/>
    <div className="toolbar"><input aria-label="Search products" placeholder="Search SKU" value={filter} onChange={event => setFilter(event.target.value)}/></div>
    <Status query={query}>{data => <section className="panel table-scroll">
      <table><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock available</th></tr></thead><tbody>{data.items.filter(product =>
        (product.name + " " + product.id).toLowerCase().includes(filter.toLowerCase())).map(product =>
        <tr key={product.id}><td>{product.name}</td><td>{product.id}</td><td>{money(product.pricePaise)}</td><td>{product.stock}</td></tr>)}</tbody></table>
    </section>}</Status>
  </>;
}

export function Plans() {
  const query = useApi("/admin/plans");
  return <><Topbar title="Package plans"/><Status query={query}>{data => <section className="package-grid">{data.items.map(plan =>
    <article className="panel" key={plan.id}><span>{plan.cadence}</span><h2>{plan.name}</h2><p>{plan.contents}</p><strong>{money(plan.pricePaise)} · {plan.drops} deliveries</strong></article>
  )}</section>}</Status></>;
}

export function Homepage() {
  const query = useApi("/v1/home");
  return <><Topbar title="Published homepage"/><Status query={query}>{data => <section className="panel"><h2>{data.hero.headline}</h2>
    <p>{data.hero.cta} · Revision {data.revision}</p><img className="home-poster" src={data.hero.poster} alt="Published homepage photo"/>
  </section>}</Status></>;
}

export function Coverage() {
  const query = useApi("/admin/coverage");
  return <><Topbar title="Coverage register"/><Status query={query}>{data => <section className="panel table-scroll"><table>
    <thead><tr><th>PIN</th><th>Locality</th><th>Status</th></tr></thead><tbody>{data.items.map(entry =>
      <tr key={entry.pin}><td>{entry.pin}</td><td>{entry.locality}</td><td>{entry.status}</td></tr>)}</tbody>
  </table></section>}</Status></>;
}

const refundActions = {
  requested: ["under_review", "Start review"], under_review: ["initiated", "Record refund initiation"], initiated: ["processed", "Mark processed"]
};

export function Returns() {
  const query = useApi("/admin/returns");
  return <><Topbar title="Return requests"/><Status query={query}>{data =>
    data.items.length ? data.items.map(entry => <ReturnCard key={entry.requestRef} entry={entry} refresh={query.reload}/>) : <p>No return requests.</p>
  }</Status></>;
}

function ReturnCard({ entry, refresh }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const action = refundActions[entry.status];
  async function update(event) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await request("/admin/refunds", { method: "POST", body: {
        requestRef: entry.requestRef, status: action[0], ...(action[0] === "initiated" && { amountPaise: Math.round(Number(amount) * 100) })
      } });
      refresh();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <article className="panel">
    <h2>{entry.requestRef}</h2>
    <p>{entry.orderRef} · {entry.reason} · {entry.status.replaceAll("_", " ")}</p>
    {entry.detail && <p>{entry.detail}</p>}
    {entry.refundAmountPaise != null && <p>Recorded refund {money(entry.refundAmountPaise)}</p>}
    {entry.photoCount > 0 && <div className="admin-photos">{Array.from({ length: entry.photoCount }, (_, index) =>
      <img key={index} src={"/admin/returns/" + entry.requestRef + "/photos/" + index} alt={"Return evidence " + (index + 1)}/>
    )}</div>}
    {action && <form onSubmit={update}>
      {action[0] === "initiated" && <label>Refund amount (₹) <input required type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)}/></label>}
      <button className="button" disabled={busy} type="submit">{action[1]}</button>
    </form>}
    <ErrorMessage error={error}/>
  </article>;
}
