import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";

export const generateImage = async (req, res) => {
  try {
    // Get prompt from client and userId from auth middleware.
    // Adjust according to your auth middleware (req.user / req.userId / req.user._id)
    const { prompt } = req.body;
    const userId = req.user?.id || req.user?._id || req.userId || req.user; // flexible

    if (!userId || !prompt) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Fix: check user document (not userModel) for negative balance
    if (user.creditBalance === 0 || user.creditBalance < 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    // Build form data
    const formData = new FormData();
    formData.append("prompt", prompt);

    // include formData headers (boundary/content-type)
    const headers = {
      ...formData.getHeaders(),
      "x-api-key": process.env.CLIPDROP_API,
    };

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers,
        responseType: "arraybuffer", // provider returns binary image
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // decrement credit and return updated balance
    const updated = await userModel.findByIdAndUpdate(
      user._id,
      { $inc: { creditBalance: -1 } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Image Generated",
      creditBalance: updated.creditBalance,
      resultImage,
    });
  } catch (error) {
    // better logging for provider errors
    console.error("generateImage error:", {
      message: error.message,
      response: error.response?.data,
    });
    return res.json({
      success: false,
      message: error.response?.data?.message || error.message || "Server error",
    });
  }
};
