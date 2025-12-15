import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { catchAsync } from '../utils/catchAsync';

export class DashboardController {
  private dashboardService = new DashboardService();

  getStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await this.dashboardService.getStats();
    res.send({ success: true, data: stats });
  });
}
