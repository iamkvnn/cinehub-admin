import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { catchAsync } from '../utils/catchAsync';

export class DashboardController {
  private dashboardService = new DashboardService();

  getStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await this.dashboardService.getStats();
    res.send({ success: true, data: stats });
  });

  getRevenueByMonth = catchAsync(async (req: Request, res: Response) => {
    const data = await this.dashboardService.getRevenueByMonth();
    res.send({ success: true, data });
  });

  getUsersByWeek = catchAsync(async (req: Request, res: Response) => {
    const data = await this.dashboardService.getUsersByWeek();
    res.send({ success: true, data });
  });

  getSubscriptionDistribution = catchAsync(
    async (req: Request, res: Response) => {
      const data = await this.dashboardService.getSubscriptionDistribution();
      res.send({ success: true, data });
    }
  );

  getActivityByDay = catchAsync(async (req: Request, res: Response) => {
    const data = await this.dashboardService.getActivityByDay();
    res.send({ success: true, data });
  });

  getTopCountries = catchAsync(async (req: Request, res: Response) => {
    const data = await this.dashboardService.getTopCountries();
    res.send({ success: true, data });
  });
}
