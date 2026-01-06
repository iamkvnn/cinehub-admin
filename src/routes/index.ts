import { Router, IRouter } from 'express';
import dashboardRoute from './dashboard.route';

const router: IRouter = Router();

router.use('/dashboard', dashboardRoute);

export default router;
