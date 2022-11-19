import Image from "next/image";
import React from "react";

const AppstoreInstall = () => {
  return (
    <div className="flex flex-1 h-[500px] flex-col items-center justify-center">
      <a
        href="https://apps.apple.com/us/app/college-table/id6444195961?itscg=30200&itsct=apps_box_appicon"
        style={{
          borderRadius: "22%",
          overflow: "hidden",
          display: "inline-block",
          verticalAlign: "middle",
        }}
        className="mb-6 w-24 h-24"
      >
        <Image
          src="https://collegetable.vercel.app/college-table-icon.png"
          alt="College Table"
          style={{
            overflow: "hidden",
            display: "inline-block",
            verticalAlign: "middle",
          }}
          width={96}
          height={96}
        />
      </a>
      <a
        href="https://apps.apple.com/us/app/college-table/id6444195961?itsct=apps_box_badge&itscg=30200"
        style={{
          display: "inline-block",
          overflow: "hidden",
          borderRadius: 13,
          width: 150,
          height: 50,
        }}
      >
        <Image
          src="https://collegetable.vercel.app/appstore-download.svg"
          alt="Download on the App Store"
          width={150}
          height={50}
        />
      </a>
    </div>
  );
};
export default AppstoreInstall;
