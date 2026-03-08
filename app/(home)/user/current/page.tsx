import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const CurrentUserPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  redirect(`/users/${user.id}`);
};

export default CurrentUserPage;
