import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const BuyCredit = () => {
  const { user, backendUrl, loadCreditData, token, setShowLogin } =
    useContext(AppContext);

  const navigate = useNavigate();

  const initPay = async (order) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Credit Payment",
      description: "Credit Payment",
      order_id: order.id, // important
      handler: async (response) => {
        // send response to server to verify signature
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-razor",
            response,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { token } } // be consistent with your auth middleware
          );

          if (data.success) {
            toast.success("Credit Added");
            loadCreditData?.(); // refresh credits
            navigate("/"); // or wherever
          } else {
            toast.error(data.message || "Verification failed");
          }
        } catch (err) {
          console.error("verify error", err);
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        email: user?.email || "",
        name: user?.name || "",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const paymentRazorpay = async (planId) => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/pay-razor",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } } // match your middleware
      );

      if (data.success && data.order) {
        initPay(data.order);
      } else {
        toast.error(data.message || "Failed to start payment");
      }
    } catch (error) {
      console.error(
        "paymentRazorpay front error:",
        error?.response?.data || error
      );
      toast.error(error.message || "Payment initiation failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 mb-1 font-semibond">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price} </span>/{" "}
              {item.credits} credits
            </p>
            <button
              onClick={() => paymentRazorpay(item.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
