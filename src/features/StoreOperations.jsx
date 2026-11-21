import React, { useState } from "react";
import { assetUrl } from "../env.ts";
import { money, request, useApi } from "../shared/api";
import { ErrorMessage, Status, Topbar } from "../shared/ui";
import { MediaUpload } from "../shared/MediaUpload";

export function Catalog() {
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const query = useApi("/admin/products");
  const categories = useApi("/admin/categories");
  return <><Topbar title="Catalog"/>
    <CategoryManager query={categories}/>
    <NewProduct categories={categories} saved={query.reload}/>
    <div className="toolbar"><input aria-label="Search products" placeholder="Search names or keywords" value={filter} onChange={event => setFilter(event.target.value)}/></div>
    {editing && <ProductEditor key={editing.id} product={editing} close={() => setEditing(null)} saved={() => { setEditing(null); query.reload(); }}/>}
    <Status query={query}>{data => {
      const term = filter.trim().toLocaleLowerCase();
      const products = data.items.filter(product => [product.name, product.bengali, product.id, ...(product.aliases || [])].some(value => value?.toLocaleLowerCase().includes(term)));
      return <section className="panel table-scroll">
      {products.length ? <table><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Available</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {products.map(product => <tr key={product.id}>
          <td><strong>{product.name}</strong>{product.bengali && <div lang="bn">{product.bengali}</div>}</td>
          <td>{product.id}</td><td>{product.variants[0]?.pricePaise == null ? "Price to be confirmed" : money(product.variants[0].pricePaise)}</td><td>{product.variants[0]?.stock ?? "—"}</td>
          <td>{product.active ? "Active" : "Archived"}</td><td><button className="button secondary" onClick={() => setEditing(product)}>Edit</button></td>
        </tr>)}
      </tbody></table> : <p>No products found.</p>}
    </section>}}</Status>
  </>;
}

function CategoryManager({ query }) {
  const [form, setForm] = useState({ id: "", name: "", bengali: "", image: "", active: true, reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(null); setMessage("");
    try {
      await request("/admin/categories/" + encodeURIComponent(form.id), { method: "PUT", body: form });
      setForm({ id: "", name: "", bengali: "", image: "", active: true, reason: "" });
      setMessage("Category saved."); query.reload();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <details className="panel cms"><summary>Manage categories</summary>
    <form onSubmit={save}>
      <label>Category ID (lowercase letters, numbers, hyphens)<input required pattern="[a-z0-9-]+" maxLength={90} value={form.id} onChange={change("id")}/></label>
      <label>English name<input required maxLength={120} value={form.name} onChange={change("name")}/></label>
      <label>Bengali name<input maxLength={120} value={form.bengali} onChange={change("bengali")}/></label>
      <label>Image path<input placeholder="/media/example.jpg" value={form.image} onChange={change("image")}/></label>
      <MediaUpload onUploaded={image => setForm(current => ({ ...current, image }))}/>
      <label><span><input type="checkbox" checked={form.active} onChange={change("active")}/> Active</span></label>
      <label>Reason<input required maxLength={300} value={form.reason} onChange={change("reason")}/></label>
      <ErrorMessage error={error}/>{message && <p role="status">{message}</p>}<button className="button" disabled={busy}>Save category</button>
    </form>
    <Status query={query}>{data => <ul>{data.items.map(category => <li key={category.slug}>
      {category.name} · {category.active ? "Active" : "Archived"}{" "}
      <button className="button secondary" onClick={() => setForm({ id: category.slug, name: category.name, bengali: category.bengali || "", image: category.image || "", active: category.active === true, reason: "" })}>Edit</button>
    </li>)}</ul>}</Status>
  </details>;
}

function NewProduct({ categories, saved }) {
  const [form, setForm] = useState({ id: "", name: "", bengali: "", category: "", image: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  async function create(event) {
    event.preventDefault(); setBusy(true); setError(null); setMessage("");
    try {
      await request("/admin/products", { method: "POST", body: form });
      setForm({ id: "", name: "", bengali: "", category: "", image: "", reason: "" });
      setMessage("Draft created. Edit it to set price, stock, and publish."); saved(); categories.reload();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <details className="panel cms"><summary>Create product</summary><Status query={categories}>{data =>
    <form onSubmit={create}><p>New products start archived with no price or stock.</p>
      <label>Product ID and SKU<input required pattern="[a-z0-9-]+" maxLength={90} value={form.id} onChange={change("id")}/></label>
      <label>English name<input required maxLength={120} value={form.name} onChange={change("name")}/></label>
      <label>Bengali name<input maxLength={120} value={form.bengali} onChange={change("bengali")}/></label>
      <label>Category<select required value={form.category} onChange={change("category")}><option value="">Choose category</option>
        {data.items.filter(category => category.active).map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}
      </select></label>
      <label>Image path<input placeholder="/media/example.jpg" value={form.image} onChange={change("image")}/></label>
      <MediaUpload onUploaded={image => setForm(current => ({ ...current, image }))}/>
      <label>Reason<input required maxLength={300} value={form.reason} onChange={change("reason")}/></label>
      <ErrorMessage error={error}/>{message && <p role="status">{message}</p>}<button className="button" disabled={busy}>Create draft</button>
    </form>}</Status>
  </details>;
}

function ProductEditor({ product, close, saved }) {
  const variant = product.variants[0];
  const [form, setForm] = useState({
    name: product.name || "", bengali: product.bengali || "", description: product.description || "",
    bengaliDescription: product.bengaliDescription || "", image: product.image || "", aliases: (product.aliases || []).join(", "),
    active: product.active === true, packSize: variant?.packSize || "", price: variant?.pricePaise == null ? "" : (variant.pricePaise / 100).toFixed(2),
    stockDelta: "0", reason: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  async function submit(event) {
    event.preventDefault();
    if (form.price && !/^\d{1,7}(\.\d{1,2})?$/.test(form.price)) {
      setError(new Error("Enter a price with at most two decimal places.")); return;
    }
    if (!/^-?\d+$/.test(form.stockDelta)) {
      setError(new Error("Enter a whole-number stock adjustment.")); return;
    }
    const [rupees, paise = ""] = form.price.split(".");
    setBusy(true); setError(null);
    try {
      await request("/admin/products/" + encodeURIComponent(product.id), { method: "PUT", body: {
        name: form.name, bengali: form.bengali, description: form.description, bengaliDescription: form.bengaliDescription,
        image: form.image, packSize: form.packSize, aliases: form.aliases.split(",").map(value => value.trim()).filter(Boolean), active: form.active,
        pricePaise: form.price ? Number(rupees) * 100 + Number(paise.padEnd(2, "0")) : null,
        stockDelta: Number(form.stockDelta), reason: form.reason, revision: product.adminRevision || 0
      } });
      saved();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <section className="panel cms"><h2>Edit {product.name}</h2>
    {!variant ? <p>This product has no editable variant.</p> : <form onSubmit={submit}>
      <label>English name<input required maxLength={120} value={form.name} onChange={change("name")}/></label>
      <label>Bengali name<input maxLength={120} value={form.bengali} onChange={change("bengali")}/></label>
      <label>English description<textarea maxLength={2000} value={form.description} onChange={change("description")}/></label>
      <label>Bengali description<textarea maxLength={2000} value={form.bengaliDescription} onChange={change("bengaliDescription")}/></label>
      <label>Search aliases, separated by commas<input value={form.aliases} onChange={change("aliases")}/></label>
      <label>Image path<input placeholder="/media/example.jpg" value={form.image} onChange={change("image")}/></label>
      <MediaUpload onUploaded={image => setForm(current => ({ ...current, image }))}/>
      <label>Pack size or unit<input maxLength={100} value={form.packSize} onChange={change("packSize")}/></label>
      <label>Price in INR (leave empty if unconfirmed)<input inputMode="decimal" value={form.price} onChange={change("price")}/></label>
      <label>Stock adjustment for {variant.id} (available now: {variant.stock})<input required type="number" step="1" value={form.stockDelta} onChange={change("stockDelta")}/></label>
      <label><span><input type="checkbox" checked={form.active} onChange={change("active")}/> Active in storefront</span></label>
      <label>Reason for change<input required maxLength={300} value={form.reason} onChange={change("reason")}/></label>
      <p>Changes apply to the first variant. Stock adjustments change available units, not quantities already held by orders.</p>
      <ErrorMessage error={error}/><div className="cms-actions"><button className="button" disabled={busy}>Save changes</button><button type="button" className="button secondary" disabled={busy} onClick={close}>Cancel</button></div>
    </form>}
  </section>;
}

export function Plans() {
  const query = useApi("/admin/package-drafts");
  const [selected, setSelected] = useState(null);
  return <><Topbar title="Package plans"/>
    <button className="button" onClick={() => setSelected({ id: "", version: 0, draft: null })}>Create package</button>
    {selected && <PlanEditor key={selected.id || "new"} plan={selected} close={() => setSelected(null)} refresh={query.reload}/>}
    <Status query={query}>{data => data.items.length ? <section className="package-grid">{data.items.map(plan =>
      <article className="panel" key={plan.id}><span>{plan.active ? "Published" : "Unpublished"} · Revision {plan.publishedRevision}</span>
        <h2>{plan.draft?.name || plan.id}</h2><p>{plan.id}</p>
        <button className="button secondary" onClick={() => setSelected(plan)}>Edit draft</button>
      </article>
    )}</section> : <p>No recurring plans available.</p>}</Status></>;
}

function PlanEditor({ plan, close, refresh }) {
  const draft = plan.draft || { name: "", cadence: "weekly", drops: 4, pricePaise: null, image: "", inventory: [] };
  const [form, setForm] = useState({
    id: plan.id, name: draft.name || "", cadence: draft.cadence || "weekly", drops: String(draft.drops || 4),
    price: draft.pricePaise == null ? "" : (draft.pricePaise / 100).toFixed(2), image: draft.image || "",
    inventory: draft.inventory.map(row => `${row.id}:${row.quantity}`).join("\n"), reason: ""
  });
  const [version, setVersion] = useState(plan.version);
  const [saved, setSaved] = useState(plan.version > 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const change = key => event => { setForm(current => ({ ...current, [key]: event.target.value })); if (key !== "reason") setSaved(false); };
  async function save(event) {
    event.preventDefault();
    if (!/^\d{1,7}(\.\d{1,2})?$/.test(form.price) || !/^\d+$/.test(form.drops)) {
      setError(new Error("Enter a valid price and delivery count.")); return;
    }
    const inventory = form.inventory.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const match = /^([a-z0-9-]+):(\d+)$/.exec(line);
      return match ? { id: match[1], quantity: Number(match[2]) } : null;
    });
    if (inventory.some(row => !row)) { setError(new Error("Enter one SKU:quantity per line.")); return; }
    const [rupees, paise = ""] = form.price.split(".");
    setBusy(true); setError(null); setMessage("");
    try {
      const result = await request("/admin/package-drafts", { method: "PUT", body: {
        id: form.id, name: form.name, cadence: form.cadence, drops: Number(form.drops),
        pricePaise: Number(rupees) * 100 + Number(paise.padEnd(2, "0")), image: form.image,
        inventory, reason: form.reason, version
      } });
      setVersion(result.version); setSaved(true); setMessage("Draft saved."); refresh();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  async function publish() {
    if (!form.reason.trim()) { setError(new Error("Enter a reason before publishing.")); return; }
    if (!window.confirm("Publish this saved package draft? Existing orders retain their terms.")) return;
    setBusy(true); setError(null);
    try {
      await request("/admin/package-drafts/" + encodeURIComponent(form.id) + "/publish", { method: "POST", body: { version, reason: form.reason } });
      close(); refresh();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <section className="panel cms"><h2>Package draft</h2><form onSubmit={save}>
    <label>Package ID<input required disabled={Boolean(plan.id) || version > 0} pattern="[a-z0-9-]+" maxLength={90} value={form.id} onChange={change("id")}/></label>
    <label>Name<input required maxLength={120} value={form.name} onChange={change("name")}/></label>
    <label>Cadence<select value={form.cadence} onChange={change("cadence")}><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
    <label>Deliveries<input type="number" min="1" max="24" required value={form.drops} onChange={change("drops")}/></label>
    <label>Full-term price (INR)<input required inputMode="decimal" value={form.price} onChange={change("price")}/></label>
    <label>Image path<input required value={form.image} onChange={change("image")}/></label>
    <MediaUpload onUploaded={image => { setForm(current => ({ ...current, image })); setSaved(false); }}/>
    <label>Contents per delivery, one SKU:quantity per line<textarea required value={form.inventory} onChange={change("inventory")}/></label>
    <label>Reason<input required maxLength={300} value={form.reason} onChange={change("reason")}/></label>
    <ErrorMessage error={error}/>{message && <p role="status">{message}</p>}
    <div className="cms-actions"><button className="button" disabled={busy}>Save draft</button>
      <button type="button" className="button publish" disabled={busy || !saved} onClick={publish}>Publish saved draft</button>
      <button type="button" className="button secondary" disabled={busy} onClick={close}>Close</button></div>
  </form></section>;
}

export function Homepage() {
  const query = useApi("/admin/homepage");
  return <><Topbar title="Homepage hero CMS"/><Status query={query}>{data => <HomeEditor initial={data}/>}</Status></>;
}

function HomeEditor({ initial }) {
  const toForm = draft => ({ ...draft, featuredIds: draft.featuredIds.join(", "), categoryIds: draft.categoryIds.join(", "), sections: draft.sections.join(", ") });
  const toDraft = form => ({
    ...form, ...Object.fromEntries(["featuredIds", "categoryIds", "sections"].map(key =>
      [key, form[key].split(",").map(value => value.trim()).filter(Boolean)]))
  });
  const [state, setState] = useState(initial);
  const [form, setForm] = useState(() => toForm(initial.draft));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("en");
  const dirty = JSON.stringify(toDraft(form)) !== JSON.stringify(state.draft);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  async function run(path, body, success) {
    setBusy(true); setError(null); setMessage("");
    try {
      const result = await request(path, { method: path.endsWith("/publish") ? "POST" : "PUT", body });
      setState(result); setForm(toForm(result.draft)); setMessage(success);
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  function save(event) {
    event.preventDefault();
    run("/admin/homepage", { version: state.version, draft: toDraft(form) }, "Draft saved.");
  }
  function publish(revision) {
    const action = revision ? `Restore revision ${revision} and publish it?` : "Publish the saved draft?";
    if (!window.confirm(action)) return;
    run("/admin/homepage/publish", { version: state.version, ...(revision && { restoreRevision: revision }) }, "Homepage published.");
  }
  return <>
    <section className="panel cms"><h2>Hero draft</h2><p>Save changes before publishing. Current published revision: {state.revision || "default"}.</p>
      <form onSubmit={save}>
        {[["headline", "Headline (English)", 120], ["headlineBn", "Headline (Bengali)", 120], ["cta", "Button text (English)", 80], ["ctaBn", "Button text (Bengali)", 80],
          ["alt", "Image description (English)", 250], ["altBn", "Image description (Bengali)", 250], ["poster", "Poster path (/media/...)", 250], ["ctaPath", "Button destination", 200],
          ["kitTitle", "Kit title (English)", 120], ["kitTitleBn", "Kit title (Bengali)", 120], ["kitBlurb", "Kit description (English)", 300],
          ["kitBlurbBn", "Kit description (Bengali)", 300], ["kitCta", "Kit button (English)", 80], ["kitCtaBn", "Kit button (Bengali)", 80], ["kitPath", "Kit destination", 200]
        ].map(([key, label, max]) => <label key={key}>{label}<input required maxLength={max} value={form[key]} onChange={change(key)}/></label>)}
        <MediaUpload onUploaded={poster => setForm(current => ({ ...current, poster }))}/>
        <label>Featured product IDs, in order (comma-separated)<input value={form.featuredIds} onChange={change("featuredIds")}/></label>
        <label>Category IDs, in order (comma-separated)<input value={form.categoryIds} onChange={change("categoryIds")}/></label>
        <label>Sections, in order: categories, featured, kits<input value={form.sections} onChange={change("sections")}/></label>
        <ErrorMessage error={error}/>{message && <p role="status">{message}</p>}
        <div className="cms-actions"><button className="button" disabled={busy}>Save draft</button>
          <button type="button" className="button publish" disabled={busy || dirty || !state.version} onClick={() => publish()}>Publish saved draft</button></div>
        {dirty && <p>Save this draft before publishing or restoring a revision.</p>}
      </form>
    </section>
    <section className="panel"><h2>Draft preview</h2>
      <label>Language <select value={preview} onChange={event => setPreview(event.target.value)}><option value="en">English</option><option value="bn">Bengali</option></select></label>
      <img className="home-poster" src={assetUrl(form.poster)} alt={preview === "bn" ? form.altBn : form.alt}/>
      <h3>{preview === "bn" ? form.headlineBn : form.headline}</h3><p>{preview === "bn" ? form.ctaBn : form.cta} → {form.ctaPath}</p>
    </section>
    <section className="panel"><h2>Published revisions</h2>
      {state.history.length ? <ul>{state.history.map(entry => <li key={entry.revision}>Revision {entry.revision} · {new Date(entry.at).toLocaleString("en-IN")}
        {" "}<button className="button secondary" disabled={busy || dirty} onClick={() => publish(entry.revision)}>Restore and publish</button></li>)}</ul> : <p>No published revisions yet.</p>}
    </section>
  </>;
}

export function Coverage() {
  const query = useApi("/admin/coverage");
  const [form, setForm] = useState({ pin: "", locality: "", status: "eligible", reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(null); setMessage("");
    try {
      await request("/admin/coverage/" + encodeURIComponent(form.pin), { method: "PUT", body: {
        locality: form.locality, status: form.status, reason: form.reason
      } });
      setMessage("Coverage saved."); setForm({ pin: "", locality: "", status: "eligible", reason: "" }); query.reload();
    } catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <><Topbar title="Coverage register"/>
    <section className="panel cms"><h2>Add or update a PIN</h2><p>Changes apply to new delivery checks; existing order records are unchanged.</p>
      <form onSubmit={save}><label>PIN<input required pattern="[0-9]{6}" inputMode="numeric" value={form.pin} onChange={change("pin")}/></label>
        <label>Locality<input required maxLength={120} value={form.locality} onChange={change("locality")}/></label>
        <label>Status<select value={form.status} onChange={change("status")}><option value="eligible">Eligible</option><option value="paused">Paused</option></select></label>
        <label>Reason<input required maxLength={300} value={form.reason} onChange={change("reason")}/></label>
        <ErrorMessage error={error}/>{message && <p role="status">{message}</p>}<button className="button" disabled={busy}>Save coverage</button>
      </form>
    </section>
    <Status query={query}>{data => <section className="panel table-scroll"><table>
      <thead><tr><th>PIN</th><th>Locality</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.items.map(entry =>
        <tr key={entry.pin}><td>{entry.pin}</td><td>{entry.locality}</td><td>{entry.status}</td><td><button className="button secondary" onClick={() => setForm({ ...entry, reason: "" })}>Edit</button></td></tr>)}</tbody>
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
      <img key={index} src={assetUrl("/admin/returns/" + entry.requestRef + "/photos/" + index)} alt={"Return evidence " + (index + 1)}/>
    )}</div>}
    {action && <form onSubmit={update}>
      {action[0] === "initiated" && <label>Refund amount (₹) <input required type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)}/></label>}
      <button className="button" disabled={busy} type="submit">{action[1]}</button>
    </form>}
    <ErrorMessage error={error}/>
  </article>;
}
