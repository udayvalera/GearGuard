-- AlterTable
ALTER TABLE "MaintenanceTeam" ADD COLUMN     "manager_id" INTEGER;

-- AddForeignKey
ALTER TABLE "MaintenanceTeam" ADD CONSTRAINT "MaintenanceTeam_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
