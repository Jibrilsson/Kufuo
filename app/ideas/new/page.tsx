import { getCompletedMember } from "../../_components/protected-page";
import { IdeaForm } from "./IdeaForm";

export const dynamic = "force-dynamic";

export default async function NewIdeaPage() {
  const { user } = await getCompletedMember("/ideas/new");
  return <IdeaForm userId={user.userId} />;
}
