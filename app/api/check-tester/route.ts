import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return Response.json({ isTester: false });

    const testerEmails = (process.env.TESTER_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isTester = testerEmails.includes(user.email.toLowerCase());
    return Response.json({ isTester });
  } catch {
    return Response.json({ isTester: false });
  }
}
