import authService from "./auth.service";
import productService from "./product.service";
import cartService from "./cart.service";
import orderService from "./order.service";
import paymentService from "./payment.service";
import adminService from "./admin.service";
import userService from "./user.service";

export {
  authService,
  productService,
  cartService,
  orderService,
  paymentService,
  adminService,
  userService,
};

export default {
  auth: authService,
  product: productService,
  cart: cartService,
  order: orderService,
  payment: paymentService,
  admin: adminService,
  user: userService,
};
