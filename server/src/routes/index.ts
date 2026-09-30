import { Router } from 'express';
import { configRouter } from './config.routes.js';
import { authRouter } from './auth.routes.js';
import { accountRouter } from './account.routes.js';
import { productsRouter } from './products.routes.js';
import { categoriesRouter } from './categories.routes.js';
import { bannersRouter } from './banners.routes.js';
import { pincodesRouter } from './pincodes.routes.js';
import { brandsRouter } from './brands.routes.js';
import { couponsRouter } from './coupons.routes.js';
import { checkoutRouter } from './checkout.routes.js';
import { cartRouter } from './cart.routes.js';
import { wishlistRouter } from './wishlist.routes.js';
import { ordersRouter } from './orders.routes.js';
import { reviewsRouter } from './reviews.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/config', configRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/account', accountRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/banners', bannersRouter);
apiRouter.use('/pincodes', pincodesRouter);
apiRouter.use('/brands', brandsRouter);
apiRouter.use('/coupons', couponsRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/admin', adminRouter);

