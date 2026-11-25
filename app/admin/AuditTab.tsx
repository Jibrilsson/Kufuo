"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { Empty, Notice, errorText } from "../_ui/bits";
import { useT } from "../_ui/lang";

type AuditRow = { id: number; actor_id: string | null; table_name: string; row_id: string | null; action: string; old_row: Record<string, unknown> | null; new_row: Record<string, unknown> | null; created_at: string };

const IGNORED = new Set(["updated_at", "created_at"]);

function changes(row: AuditRow) {
  if (row.action !== "update" || !row.old_row || !row.new_row) return row.action;
  return Object.keys(row.new_row)
    .filter((key) => !IGNORED.has(key) && JSON.stringify(row.old_row?.[key]) !== JSON.stringify(row.new_row?.[key]))
    .map((key) => `${key}: ${JSON.stringify(row.old_row?.[key])} → ${JSON.stringify(row.new_row?.[key])}`)
    .join("; ") || "update";
}

export function AuditTab() {
  const { t, arabic } = useT();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient().from("audit_log").select("*").order("created_at", { ascending: false }).limit(200).then(({ data, error: e }: { data: unknown; error: unknown }) => {
      setRows((data ?? []) as AuditRow[]);
      setError(e ? errorText(e) : "");
    });
  }, []);

  if (!rows.length && !error) return <Empty title={t("No changes recorded yet", "ما فيه تغييرات مسجلة")} />;

  return (
    <>
      <Notice kind="error">{error}</Notice>
      <div className="kx-table-wrap">
        <table className="kx-table kx-table-dense">
          <thead><tr><th>{t("When", "متى")}</th><th>{t("Table", "الجدول")}</th><th>{t("Action", "العملية")}</th><th>{t("Change", "التغيير")}</th><th>{t("By", "بواسطة")}</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString(arabic ? "ar" : "en-GB")}</td>
                <td>{r.table_name}</td>
                <td>{r.action}</td>
                <td className="kx-mono">{changes(r)}</td>
                <td className="kx-mono">{r.actor_id ? r.actor_id.slice(0, 8) : t("system", "النظام")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
