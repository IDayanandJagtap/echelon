import TaskDashboard from "@/app/pages/tasks/tasks-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function TasksPage() {
  const user = await getCurrentUser();
  return <TaskDashboard userId={user.id} />;
}