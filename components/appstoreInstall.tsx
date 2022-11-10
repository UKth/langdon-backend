import React from "react";

const AppstoreInstall = () => {
  return (
    <button
      className="bg-blue-500 p-1 hover:scale-95 rounded"
      onClick={() => {
        document.location = "https://apps.apple.com/app/id6444195961";
      }}
    >
      <p className="text-xl bg-blue-300 rounded-3xl text-white p-2">
        Install College Table in Appstore
      </p>
    </button>
  );
};
export default AppstoreInstall;
