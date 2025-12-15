import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Film } from '../entities/Film';
import { Subscription } from '../entities/Subscription';
import { Plan } from '../entities/Plan';

export class DashboardService {
  async getStats() {
    const userRepository = AppDataSource.getRepository(User);
    const filmRepository = AppDataSource.getRepository(Film);
    const subscriptionRepository = AppDataSource.getRepository(Subscription);

    const totalUsers = await userRepository.count();
    const totalFilms = await filmRepository.count();
    const totalSubscriptions = await subscriptionRepository.count();

    // Calculate revenue (simplified: sum of plan prices for active subscriptions)
    // In a real app, this would come from Stripe or a payment transaction table
    const activeSubscriptions = await subscriptionRepository.find({
      where: { status: 'ACTIVE' as any }, // TypeORM enum issue workaround
      relations: ['plan'],
    });

    const revenue = activeSubscriptions.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);

    return {
      totalUsers,
      totalFilms,
      totalSubscriptions,
      revenue,
    };
  }
}
