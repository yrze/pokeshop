import { cookies } from "next/headers";
import { hashAdminSessionToken } from "./adminSession";
import { prisma } from "./prisma";

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;

    const hashedToken = hashAdminSessionToken(token);
    const session = await prisma.adminSession.findFirst({
      where: {
        OR: [{ token: hashedToken }, { token }],
      },
    });

    if (!session) return false;
    if (session.expiresAt < new Date()) {
      await prisma.adminSession.delete({ where: { id: session.id } });
      return false;
    }

    if (session.token !== hashedToken) {
      await prisma.adminSession
        .update({
          where: { id: session.id },
          data: { token: hashedToken },
        })
        .catch(() => null);
    }

    return true;
  } catch {
    return false;
  }
}
