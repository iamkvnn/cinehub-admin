import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Film } from '../entities/Film';
import { Subscription, SubscriptionStatus } from '../entities/Subscription';
import { Plan } from '../entities/Plan';
import { Between, MoreThanOrEqual } from 'typeorm';

// Helper to get Vietnamese day name
const VIETNAMESE_DAYS = [
  'CN',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

// Plan colors for pie chart
const PLAN_COLORS: Record<string, string> = {
  FREE: '#94a3b8', // slate-400
  BASIC: '#3b82f6', // blue-500
  PREMIUM: '#8b5cf6', // violet-500
  ENTERPRISE: '#f59e0b', // amber-500
};

export class DashboardService {
  private userRepository = AppDataSource.getRepository(User);
  private filmRepository = AppDataSource.getRepository(Film);
  private subscriptionRepository = AppDataSource.getRepository(Subscription);
  private planRepository = AppDataSource.getRepository(Plan);

  /**
   * Get basic dashboard statistics
   */
  async getStats() {
    const totalUsers = await this.userRepository.count();
    const totalFilms = await this.filmRepository.count();

    // Count active subscriptions
    const totalSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    // Calculate total views from all films
    const viewsResult = await this.filmRepository
      .createQueryBuilder('film')
      .select('SUM(film.views)', 'totalViews')
      .getRawOne();
    const totalViews = parseInt(viewsResult?.totalViews || '0', 10);

    // Calculate revenue from active subscriptions
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });
    const revenue = activeSubscriptions.reduce(
      (sum, sub) => sum + (sub.plan?.price || 0),
      0
    );

    // Count new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    return {
      totalUsers,
      totalFilms,
      totalSubscriptions,
      revenue,
      totalViews,
      newUsersToday,
    };
  }

  /**
   * Get revenue data by month for the last 12 months
   */
  async getRevenueByMonth() {
    const months: { month: string; revenue: number; users: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Get subscriptions created in this month
      const subscriptions = await this.subscriptionRepository.find({
        where: {
          startDate: Between(startOfMonth, endOfMonth),
          status: SubscriptionStatus.ACTIVE,
        },
        relations: ['plan'],
      });

      const revenue = subscriptions.reduce(
        (sum, sub) => sum + (sub.plan?.price || 0),
        0
      );

      // Count new users in this month
      const newUsers = await this.userRepository.count({
        where: { createdAt: Between(startOfMonth, endOfMonth) },
      });

      months.push({
        month: `T${date.getMonth() + 1}`,
        revenue,
        users: newUsers,
      });
    }

    return months;
  }

  /**
   * Get user data by week for the last 6 weeks
   */
  async getUsersByWeek() {
    const weeks: { week: string; newUsers: number; activeUsers: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Count new users registered this week
      const newUsers = await this.userRepository.count({
        where: { createdAt: Between(weekStart, weekEnd) },
      });

      // Count users with active subscriptions (as proxy for "active users")
      const activeUsersResult = await this.subscriptionRepository
        .createQueryBuilder('subscription')
        .select('COUNT(DISTINCT subscription.userId)', 'count')
        .where('subscription.status = :status', {
          status: SubscriptionStatus.ACTIVE,
        })
        .andWhere('subscription.startDate <= :weekEnd', { weekEnd })
        .getRawOne();

      weeks.push({
        week: `Tuần ${6 - i}`,
        newUsers,
        activeUsers: parseInt(activeUsersResult?.count || '0', 10),
      });
    }

    return weeks;
  }

  /**
   * Get subscription distribution by plan
   */
  async getSubscriptionDistribution() {
    const plans = await this.planRepository.find();
    const distribution: { name: string; value: number; fill: string }[] = [];

    for (const plan of plans) {
      const count = await this.subscriptionRepository.count({
        where: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      if (count > 0) {
        distribution.push({
          name: plan.name,
          value: count,
          fill: PLAN_COLORS[plan.planType] || '#6b7280',
        });
      }
    }

    // Sort by value descending
    distribution.sort((a, b) => b.value - a.value);

    return distribution;
  }

  /**
   * Get activity data by day for the last 7 days
   */
  async getActivityByDay() {
    const days: { day: string; subscriptions: number; films: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      );

      // Count subscriptions created this day
      const subscriptionCount = await this.subscriptionRepository.count({
        where: { createdAt: Between(startOfDay, endOfDay) },
      });

      // Count films created/updated this day
      const filmCount = await this.filmRepository.count({
        where: { createdAt: Between(startOfDay, endOfDay) },
      });

      days.push({
        day: VIETNAMESE_DAYS[date.getDay()],
        subscriptions: subscriptionCount,
        films: filmCount,
      });
    }

    return days;
  }

  /**
   * Get top countries by film count
   */
  async getTopCountries() {
    const result = await this.filmRepository
      .createQueryBuilder('film')
      .select('film.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('film.country')
      .orderBy('count', 'DESC')
      .limit(6)
      .getRawMany();

    return result.map((row) => ({
      country: row.country || 'Unknown',
      count: parseInt(row.count, 10),
    }));
  }
}
