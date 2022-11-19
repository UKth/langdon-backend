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
      {/* src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1667952000&h=18db8973b176528582cc32564ac25c29"
    src="https://is3-ssl.mzstatic.com/image/thumb/Purple122/v4/1f/14/6d/1f146dff-ca54-49f0-9548-da4b2eab99ef/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/540x540bb.jpg&h=f65a12b03a4d79dba55bdf0ec083f66c" */}
    </div>
  );
};
export default AppstoreInstall;
