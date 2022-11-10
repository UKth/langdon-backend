import AppstoreInstall from "@components/appstoreInstall";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const AddFriend: NextPage = () => {
  const router = useRouter();
  const { targetId, code } = router.query;

  useEffect(() => {
    if (targetId && code) {
      document.location = `myapp://addFriends/${targetId}/${code}`;
    }
  }, [targetId, code]);

  return (
    <div className="flex h-96 flex-row items-center justify-center">
      <button
        className="p-1 hover:scale-95 rounded"
        onClick={() => {
          document.location = "https://apps.apple.com/app/id6444195961";
        }}
      >
        <p className="text-xl bg-blue-300 rounded-3xl text-white p-2">
          Install College Table in Appstore
        </p>
      </button>
    </div>
  );
};

export default AddFriend;
