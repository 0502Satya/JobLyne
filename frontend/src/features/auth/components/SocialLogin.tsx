import React from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { socialLoginAction } from "../actions";

/**
 * Re-implemented SocialLogin for restoration.
 * Provides quick login options with Google and LinkedIn.
 */
export default function SocialLogin() {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("Google Login Success:", credentialResponse);
    if (credentialResponse.credential) {
      const result = await socialLoginAction("google", credentialResponse.credential);
      
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(result.error || "Social login failed.");
      }
    } else {
      alert("No credential returned from Google.");
    }
  };

  const handleSocialLogin = async (provider: "google" | "linkedin") => {
    if (provider === "google") {
      return; // Handled by standard GoogleLogin component
    }

    // LinkedIn login (placeholder for now)
    console.log(`Initiating ${provider} login...`);
    alert(`${provider} login is coming soon. Please use Google for now.`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-stretch">
        {/* Google Login Option */}
        <div className="flex justify-center w-full min-h-[44px] overflow-hidden rounded-lg">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google Login Failed");
              alert("Google Login Failed. Please try again.");
            }}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>
        
        {/* LinkedIn Login Option */}
        <button 
          onClick={() => handleSocialLogin("linkedin")}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-300 text-sm w-full min-h-[44px]"
        >
          <svg className="w-5 h-5 fill-[#0077b5]" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          LinkedIn
        </button>
      </div>
    </div>
  );
}
