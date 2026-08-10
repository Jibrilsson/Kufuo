import { getProtectedUser } from "../../_components/protected-page";
import { IdeaForm } from "./IdeaForm";

export const dynamic = "force-dynamic";

export default async function NewIdeaPage() {
  const user = await getProtectedUser("/ideas/new");
  return <IdeaForm userId={user.userId} />;
}
