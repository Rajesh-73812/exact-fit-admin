// app/page.tsx or any component

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@email.com" },
  { id: 2, name: "Bob", email: "bob@email.com" },
  // Add more rows as needed
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

export default function Home() {
  return (
    <main className="p-4">
      <DataTable columns={columns} data={users} />
    </main>
  );
}
