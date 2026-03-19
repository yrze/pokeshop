import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;

    const session = await prisma.adminSession.findUnique({ where: { token } });
    if (!session) return false;
    if (session.expiresAt < new Date()) {
      await prisma.adminSession.delete({ where: { id: session.id } });
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
