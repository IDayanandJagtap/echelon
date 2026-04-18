import { getCurrentUser } from "@/lib/auth";
import RoadmapDetails from "@/app/pages/ai/RoadmapDetails";

export default async function RoadmapPage({ params }) {
  const user = await getCurrentUser();

  return <RoadmapDetails roadmapId={params.id} userId={user.id} />;
}