import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="flex items-center justify-between gap-4 py-3 mt-20">
      <img src={assets.logo} alt="" width={150} />
      <p className="flex-1 border-l border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden">
        Copyright @ShashankSharma.dev | All right reserved.
      </p>
      <div className="flex gap-2.5">
        <a href={import.meta.env.VITE_LINKEDIN_URL} target="_blank">
          <img src={assets.linkedin_icon} width={35} />
        </a>
        <a href={import.meta.env.VITE_FACEBOOK_URL} target="_blank">
          <img src={assets.facebook_icon} width={35} />
        </a>

        <a href={import.meta.env.VITE_TWITTER_URL} target="_blank">
          <img src={assets.twitter_icon} width={35} />
        </a>

        <a href={import.meta.env.VITE_INSTAGRAM_URL} target="_blank">
          <img src={assets.instagram_icon} width={35} />
        </a>
      </div>
    </div>
  );
};

export default Footer;
