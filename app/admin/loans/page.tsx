import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLoans from "@/components/AdminLoans";

export default async function AdminLoansPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
  return <AdminLoans />;
}
