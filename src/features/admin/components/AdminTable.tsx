import React from 'react';
import { Edit2, Loader2, Trash2 } from 'lucide-react';

/** The bordered card + table chrome every admin tab shares: headers row and divided body. */
export const AdminTable: React.FC<{ headers: string[]; children: React.ReactNode }> = ({
  headers,
  children,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-muted/50 border-b border-border">
        <tr>
          {headers.map((header, index) => (
            <th
              key={header}
              className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                index === headers.length - 1 ? 'text-right' : 'text-left'
              }`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">{children}</tbody>
    </table>
  </div>
);

/** The edit / delete-with-spinner button pair every admin row ends with. */
export const AdminRowActions: React.FC<{
  entityName: string;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entityName, deleting, onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-1">
    <button
      onClick={onEdit}
      aria-label={`Edit ${entityName}`}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Edit2 className="size-4" />
    </button>
    <button
      onClick={onDelete}
      disabled={deleting}
      aria-label={`Delete ${entityName}`}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  </div>
);
