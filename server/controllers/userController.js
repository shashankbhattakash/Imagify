import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" }); // <-- FIXED
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.json({ success: true, token, user: { name: user.name } }); // <-- FIXED (added return)
    } else {
      return res.json({ success: false, message: "Invalid credentials" }); // <-- FIXED
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// controllers/userController.js (only the userCredits function)
const userCredits = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const credits =
      typeof user.creditBalance === "number" ? user.creditBalance : 0;

    return res.json({
      success: true,
      credits,
      user: { name: user.name },
    });
  } catch (error) {
    console.error("userCredits error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorpay = async (req, res) => {
  try {
    // get planId from client, and user id from auth middleware
    const { planId } = req.body;
    const userId = req.user?.id || req.user?._id || req.userId || req.user;

    if (!userId || !planId) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // find user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    // resolve plan details
    let credits, plan, amount;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10; // INR
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: "Plan not found" });
    }

    const date = Date.now();

    // create transaction record (payment=false initially)
    const transactionData = {
      userId,
      plan,
      amount,
      credits,
      date,
      payment: false,
    };
    const newTransaction = await transactionModel.create(transactionData);

    // create razorpay order (amount must be in paise)
    const options = {
      amount: amount * 100, // paise
      currency: process.env.CURRENCY || "INR",
      receipt: newTransaction._id.toString(),
    };

    // use promise-style create
    const order = await razorpayInstance.orders.create(options);

    // respond with order
    return res.json({ success: true, order });
  } catch (error) {
    console.error("paymentRazorpay error:", error?.response?.data || error);
    return res.json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );
      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment Failed" });
      }
      const userData = await userModel.findById(transactionData.userId);

      const creditBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance });
      await transactionModel.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });

      res.json({ success: true, message: "Credits Added" });
    } else {
      res.json({ success: false, message: error.message });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export { registerUser, loginUser, userCredits, verifyRazorpay };
