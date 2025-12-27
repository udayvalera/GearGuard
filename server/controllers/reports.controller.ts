import type { Request, Response } from "express";
import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

// 4.1 Request Breakdown Report
export const getRequestBreakdown = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { group_by } = req.query;

    if (!group_by || !["team", "category"].includes(String(group_by))) {
      res.status(400).json({ error: "Invalid group_by parameter" });
      return;
    }

    // GROUP BY TEAM
    if (group_by === "team") {
      const data = await prisma.maintenanceRequest.groupBy({
        by: ["team_id"],
        _count: { _all: true },
      });

      const response = await Promise.all(
        data.map(async (item) => {
          const team = await prisma.maintenanceTeam.findUnique({
            where: { id: item.team_id },
            select: { name: true },
          });

          return {
            group: team?.name ?? "Unknown",
            count: item._count._all,
          };
        })
      );

      res.json(response);
      return;
    }

    // GROUP BY CATEGORY
    if (group_by === "category") {
      const requests = await prisma.maintenanceRequest.findMany({
        include: {
          equipment: {
            include: {
              category: { select: { name: true } },
            },
          },
        },
      });

      const categoryMap: Record<string, number> = {};

      requests.forEach((req) => {
        const categoryName = req.equipment.category.name;
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
      });

      const response = Object.entries(categoryMap).map(
        ([group, count]) => ({
          group,
          count,
        })
      );

      res.json(response);
      return;
    }
  } catch (error) {
    console.error("Request Breakdown Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
