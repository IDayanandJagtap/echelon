import AIPage from "@/app/pages/ai";
import { getCurrentUser } from "@/lib/auth";

export default async function AIPageRoute() {
  const user = await getCurrentUser();
  return <AIPage userId={user.id} />;
}