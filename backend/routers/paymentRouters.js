import { Router } from "express";
import {
  getRazorKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayment
} from "../controllers/payment.controllers.js";
import isLoggedIn, { authorizedRoles } from "../middleware/authMiddleware.js";
const router = new Router();

router.route("/razorpaykey")
.get(
  isLoggedIn,
  getRazorKey
  );

router.route("/subscribe")
.post(
  isLoggedIn,
  buySubscription
  );

router.route("/verify")
 .post(
  isLoggedIn,
  verifySubscription
  );

router.route('/cancel')
.post(
  isLoggedIn,
  cancelSubscription)

router.route('/')
.get(
  isLoggedIn,
  authorizedRoles('ADMIN'),
  allPayment)


export default router;
