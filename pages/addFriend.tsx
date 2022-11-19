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
      <AppstoreInstall />
    </div>
  );
};

export default AddFriend;
