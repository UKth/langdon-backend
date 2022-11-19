import AppstoreInstall from "@components/appstoreInstall";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const AddFriend: NextPage = () => {
  const router = useRouter();
  const { targetId, code } = router.query;

  useEffect(() => {
    if (targetId && code) {
      document.location = `collegetable://addFriend/${targetId}/${code}`;
      // document.location = `exp://10.140.208.89:19000/--/addFriend/${targetId}/${code}`;
    }
  }, [targetId, code]);

  return (
    <div className="flex">
      <Head>
        <title>Add new friend</title>
        <meta
          name="description"
          content="College Table | Add friend"
          key="desc"
        />
        <meta property="og:title" content="College Table | Add friend" />
        <meta
          property="og:description"
          content="Someone wants to be a friend with you"
        />
        <meta
          property="og:image"
          content="https://collegetable.vercel.app/og.png"
        />
      </Head>
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
    </div>
  );
};

export default AddFriend;
