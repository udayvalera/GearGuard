-- CreateIndex
CREATE INDEX "MaintenanceRequest_scheduled_date_idx" ON "MaintenanceRequest"("scheduled_date");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_stage_id_idx" ON "MaintenanceRequest"("stage_id");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_team_id_idx" ON "MaintenanceRequest"("team_id");
