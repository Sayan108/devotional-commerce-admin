import React from "react";

export function Topbar({ title, subtitle }) {
  return <header className="topbar"><div><span>Operations</span><h1>{title}</h1></div>{subtitle && <small>{subtitle}</small>}</header>;
}

export function ErrorMessage({ error }) {
  return error ? <p className="request-error" role="alert">{error.message}</p> : null;
}

export function Status({ query, children }) {
  if (query.error) return <><ErrorMessage error={query.error}/><button type="button" className="button secondary" onClick={query.reload}>Try again</button></>;
  return query.data ? children(query.data) : <p role="status">Loading…</p>;
}
