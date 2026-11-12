import { redirect } from "next/navigation";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const prompt = params?.prompt;
  if (prompt && typeof prompt === "string") {
    redirect(`/studioreact?prompt=${encodeURIComponent(prompt)}`);
  }
  redirect("/studioreact");
}
